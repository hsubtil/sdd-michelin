import { randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { TemplateVariable } from '@/template/domain/entities/template-variable.entity';
import { Template } from '@/template/domain/entities/template.entity';
import { ITemplateRepository } from '@/template/domain/ports/out/i-template.repository';
import { TemplateVersionOrm } from '@/template/infrastructure/persistence/entities/template-version.orm.entity';
import { TemplateOrm } from '@/template/infrastructure/persistence/entities/template.orm.entity';
import { VariableOrm } from '@/template/infrastructure/persistence/entities/variable.orm.entity';

@Injectable()
export class TemplateOrmRepository implements ITemplateRepository {
  constructor(
    @InjectRepository(TemplateOrm)
    private readonly templateRepository: Repository<TemplateOrm>,
    @InjectRepository(TemplateVersionOrm)
    private readonly versionRepository: Repository<TemplateVersionOrm>,
    @InjectRepository(VariableOrm)
    private readonly variableRepository: Repository<VariableOrm>,
    private readonly dataSource: DataSource,
  ) {}

  async findByName(name: string): Promise<Template | null> {
    const templateOrm = await this.templateRepository.findOne({
      where: { name },
      relations: {
        versions: {
          variables: true,
        },
      },
      order: {
        versions: {
          versionNumber: 'DESC',
        },
      },
    });

    if (!templateOrm || templateOrm.versions.length === 0) {
      return null;
    }

    const latestVersion = templateOrm.versions[0];
    const variables = latestVersion.variables.map((variable) =>
      TemplateVariable.reconstitute(variable.id, variable.name, variable.defaultValue),
    );

    return Template.reconstitute({
      id: templateOrm.id,
      name: templateOrm.name,
      tags: latestVersion.tags,
      content: latestVersion.content,
      variables,
      currentVersion: templateOrm.currentVersion,
      createdAt: templateOrm.createdAt,
    });
  }

  async createTemplateWithInitialVersion(template: Template): Promise<Template> {
    await this.dataSource.transaction(async (manager) => {
      const templateOrm = this.templateRepository.create({
        id: template.id,
        name: template.name,
        currentVersion: template.currentVersion,
        createdAt: template.createdAt,
      });

      await manager.save(TemplateOrm, templateOrm);

      const versionOrm = this.versionRepository.create({
        id: randomUUID(),
        templateId: template.id,
        versionNumber: 1,
        content: template.content,
        tags: [...template.tags],
        createdAt: template.createdAt,
      });

      await manager.save(TemplateVersionOrm, versionOrm);

      const variableOrms = template.variables.map((variable) =>
        this.variableRepository.create({
          id: variable.id,
          templateVersionId: versionOrm.id,
          name: variable.name,
          defaultValue: variable.defaultValue,
        }),
      );

      if (variableOrms.length > 0) {
        await manager.save(VariableOrm, variableOrms);
      }
    });

    return template;
  }
}
