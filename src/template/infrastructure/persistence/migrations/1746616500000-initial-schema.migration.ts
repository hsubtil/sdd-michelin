import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1746616500000 implements MigrationInterface {
  name = 'InitialSchema1746616500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type === 'mysql') {
      await this.createMysqlSchema(queryRunner);
      return;
    }

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "templates" (
        "id" uuid NOT NULL,
        "name" character varying(50) NOT NULL,
        "current_version" integer NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_templates_name" UNIQUE ("name"),
        CONSTRAINT "PK_templates_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "template_versions" (
        "id" uuid NOT NULL,
        "template_id" uuid NOT NULL,
        "version_number" integer NOT NULL,
        "content" text NOT NULL,
        "tags" text array NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_template_versions_id" PRIMARY KEY ("id"),
        CONSTRAINT "uq_template_version" UNIQUE ("template_id", "version_number"),
        CONSTRAINT "FK_template_versions_template" FOREIGN KEY ("template_id") REFERENCES "templates"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "template_variables" (
        "id" uuid NOT NULL,
        "template_version_id" uuid NOT NULL,
        "name" character varying(100) NOT NULL,
        "default_value" text,
        CONSTRAINT "PK_template_variables_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_template_variables_version" FOREIGN KEY ("template_version_id") REFERENCES "template_versions"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "prompts" (
        "id" uuid NOT NULL,
        "template_id" uuid NOT NULL,
        "version_used" integer NOT NULL,
        "content" text NOT NULL,
        "variables" jsonb NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_prompts_id" PRIMARY KEY ("id")
      )
    `);
  }

  private async createMysqlSchema(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`templates\` (
        \`id\` varchar(36) NOT NULL,
        \`name\` varchar(50) NOT NULL,
        \`current_version\` integer NOT NULL,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT \`UQ_templates_name\` UNIQUE (\`name\`),
        CONSTRAINT \`PK_templates_id\` PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`template_versions\` (
        \`id\` varchar(36) NOT NULL,
        \`template_id\` varchar(36) NOT NULL,
        \`version_number\` integer NOT NULL,
        \`content\` text NOT NULL,
        \`tags\` json NOT NULL,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT \`PK_template_versions_id\` PRIMARY KEY (\`id\`),
        CONSTRAINT \`uq_template_version\` UNIQUE (\`template_id\`, \`version_number\`),
        CONSTRAINT \`FK_template_versions_template\` FOREIGN KEY (\`template_id\`) REFERENCES \`templates\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`template_variables\` (
        \`id\` varchar(36) NOT NULL,
        \`template_version_id\` varchar(36) NOT NULL,
        \`name\` varchar(100) NOT NULL,
        \`default_value\` text,
        CONSTRAINT \`PK_template_variables_id\` PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_template_variables_version\` FOREIGN KEY (\`template_version_id\`) REFERENCES \`template_versions\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`prompts\` (
        \`id\` varchar(36) NOT NULL,
        \`template_id\` varchar(36) NOT NULL,
        \`version_used\` integer NOT NULL,
        \`content\` text NOT NULL,
        \`variables\` json NOT NULL,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT \`PK_prompts_id\` PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "prompts"');
    await queryRunner.query('DROP TABLE IF EXISTS "template_variables"');
    await queryRunner.query('DROP TABLE IF EXISTS "template_versions"');
    await queryRunner.query('DROP TABLE IF EXISTS "templates"');
  }
}
