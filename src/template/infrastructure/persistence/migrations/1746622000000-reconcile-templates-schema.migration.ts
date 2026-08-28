import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReconcileTemplatesSchema1746622000000 implements MigrationInterface {
  name = 'ReconcileTemplatesSchema1746622000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type === 'mysql') {
      return;
    }

    const hasTemplatesTable = await queryRunner.hasTable('templates');
    if (!hasTemplatesTable) {
      return;
    }

    const hasName = await queryRunner.hasColumn('templates', 'name');
    if (!hasName) {
      await queryRunner.query(
        'ALTER TABLE "templates" ADD COLUMN "name" character varying(50)',
      );
    }

    const hasSignature = await queryRunner.hasColumn('templates', 'signature');
    if (hasSignature) {
      await queryRunner.query(
        'UPDATE "templates" SET "name" = "signature" WHERE "name" IS NULL AND "signature" IS NOT NULL',
      );
    }

    await queryRunner.query(
      'UPDATE "templates" SET "name" = LEFT("id"::text, 50) WHERE "name" IS NULL',
    );

    const hasCurrentVersion = await queryRunner.hasColumn(
      'templates',
      'current_version',
    );
    if (!hasCurrentVersion) {
      await queryRunner.query(
        'ALTER TABLE "templates" ADD COLUMN "current_version" integer',
      );
    }

    const hasCurrentVersionLegacy = await queryRunner.hasColumn(
      'templates',
      'currentVersion',
    );
    if (hasCurrentVersionLegacy) {
      await queryRunner.query(
        'UPDATE "templates" SET "current_version" = "currentVersion" WHERE "current_version" IS NULL',
      );
    }

    await queryRunner.query(
      'UPDATE "templates" SET "current_version" = 1 WHERE "current_version" IS NULL',
    );

    const hasCreatedAt = await queryRunner.hasColumn('templates', 'created_at');
    if (!hasCreatedAt) {
      await queryRunner.query(
        'ALTER TABLE "templates" ADD COLUMN "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now()',
      );
    }

    const hasCreatedAtLegacy = await queryRunner.hasColumn(
      'templates',
      'createdAt',
    );
    if (hasCreatedAtLegacy) {
      await queryRunner.query(
        'UPDATE "templates" SET "created_at" = "createdAt" WHERE "created_at" IS NULL',
      );
    }

    await queryRunner.query(
      'UPDATE "templates" SET "created_at" = now() WHERE "created_at" IS NULL',
    );

    await queryRunner.query(
      'ALTER TABLE "templates" ALTER COLUMN "name" SET NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "templates" ALTER COLUMN "current_version" SET NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "templates" ALTER COLUMN "created_at" SET NOT NULL',
    );

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'UQ_templates_name'
        ) THEN
          ALTER TABLE "templates" ADD CONSTRAINT "UQ_templates_name" UNIQUE ("name");
        END IF;
      END
      $$;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Intentionally no-op: reconciliation migration preserves existing data and legacy columns.
  }
}
