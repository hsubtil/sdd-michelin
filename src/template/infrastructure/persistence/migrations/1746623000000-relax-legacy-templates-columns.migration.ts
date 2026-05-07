import { MigrationInterface, QueryRunner } from 'typeorm';

export class RelaxLegacyTemplatesColumns1746623000000 implements MigrationInterface {
  name = 'RelaxLegacyTemplatesColumns1746623000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTemplatesTable = await queryRunner.hasTable('templates');
    if (!hasTemplatesTable) {
      return;
    }

    const hasSignature = await queryRunner.hasColumn('templates', 'signature');
    if (hasSignature) {
      await queryRunner.query('ALTER TABLE "templates" ALTER COLUMN "signature" DROP NOT NULL');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasTemplatesTable = await queryRunner.hasTable('templates');
    if (!hasTemplatesTable) {
      return;
    }

    const hasSignature = await queryRunner.hasColumn('templates', 'signature');
    if (hasSignature) {
      await queryRunner.query(
        'UPDATE "templates" SET "signature" = "name" WHERE "signature" IS NULL AND "name" IS NOT NULL',
      );
      await queryRunner.query('ALTER TABLE "templates" ALTER COLUMN "signature" SET NOT NULL');
    }
  }
}
