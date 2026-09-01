import { randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { TemplateVariable } from '@/template/domain/entities/template-variable.entity';
import { TemplateVersion } from '@/template/domain/entities/template-version.entity';
import { Template } from '@/template/domain/entities/template.entity';
import {
  ITemplateRepository,
  TemplateSearchCriteria,
} from '@/template/domain/ports/out/i-template.repository';
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

  private buildTemplateFromOrm(templateOrm: TemplateOrm): Template {
    const latestVersion = templateOrm.versions[0];
    const variables = latestVersion.variables.map((v) =>
      TemplateVariable.reconstitute(v.id, v.name, v.defaultValue),
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

  async findByName(name: string): Promise<Template | null> {
    const templateOrm = await this.templateRepository.findOne({
      where: { name },
      relations: { versions: { variables: true } },
      order: { versions: { versionNumber: 'DESC' } },
    });
    if (!templateOrm || templateOrm.versions.length === 0) {
      return null;
    }
    return this.buildTemplateFromOrm(templateOrm);
  }

  async findById(id: string): Promise<Template | null> {
    const templateOrm = await this.templateRepository.findOne({
      where: { id },
      relations: { versions: { variables: true } },
      order: { versions: { versionNumber: 'DESC' } },
    });
    if (!templateOrm || templateOrm.versions.length === 0) {
      return null;
    }
    return this.buildTemplateFromOrm(templateOrm);
  }

  async findAll(criteria?: TemplateSearchCriteria): Promise<Template[]> {
    const query = this.templateRepository
      .createQueryBuilder('template')
      .leftJoinAndSelect('template.versions', 'version')
      .leftJoinAndSelect('version.variables', 'variable')
      .orderBy('template.createdAt', 'DESC')
      .addOrderBy('version.versionNumber', 'DESC');

    if (criteria?.name) {
      query.andWhere('template.name ILIKE :name', {
        name: `%${criteria.name}%`,
      });
    }

    const templateOrms = await query.getMany();
    const templates = templateOrms
      .filter((templateOrm) => templateOrm.versions.length > 0)
      .map((templateOrm) => this.buildTemplateFromOrm(templateOrm));

    if (criteria?.tags && criteria.tags.length > 0) {
      const wantedTags = new Set(criteria.tags);
      return templates.filter((template) =>
        template.tags.some((tag) => wantedTags.has(tag)),
      );
    }

    return templates;
  }

  async findVersionsByTemplateId(
    templateId: string,
  ): Promise<TemplateVersion[]> {
    const versions = await this.versionRepository.find({
      where: { templateId },
      relations: { variables: true },
      order: { versionNumber: 'DESC' },
    });
    return versions.map((v) =>
      TemplateVersion.reconstitute({
        id: v.id,
        templateId: v.templateId,
        versionNumber: v.versionNumber,
        content: v.content,
        tags: v.tags,
        variables: v.variables.map((vv) =>
          TemplateVariable.reconstitute(vv.id, vv.name, vv.defaultValue),
        ),
        createdAt: v.createdAt,
      }),
    );
  }

  async findVersionByNumber(
    templateId: string,
    versionNumber: number,
  ): Promise<TemplateVersion | null> {
    const v = await this.versionRepository.findOne({
      where: { templateId, versionNumber },
      relations: { variables: true },
    });
    if (!v) {
      return null;
    }
    return TemplateVersion.reconstitute({
      id: v.id,
      templateId: v.templateId,
      versionNumber: v.versionNumber,
      content: v.content,
      tags: v.tags,
      variables: v.variables.map((vv) =>
        TemplateVariable.reconstitute(vv.id, vv.name, vv.defaultValue),
      ),
      createdAt: v.createdAt,
    });
  }

  async createTemplateWithInitialVersion(
    template: Template,
  ): Promise<Template> {
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

  async addNewVersion(
    templateId: string,
    data: { content: string; tags: string[]; variables: TemplateVariable[] },
  ): Promise<Template> {
    return this.dataSource.transaction(async (manager) => {
      const templateOrm = await manager.findOne(TemplateOrm, {
        where: { id: templateId },
      });

      if (!templateOrm) {
        throw new Error(`Template ${templateId} not found`);
      }

      const newVersionNumber = templateOrm.currentVersion + 1;
      const newVersionId = randomUUID();
      const now = new Date();

      const versionOrm = this.versionRepository.create({
        id: newVersionId,
        templateId,
        versionNumber: newVersionNumber,
        content: data.content,
        tags: [...data.tags],
        createdAt: now,
      });
      await manager.save(TemplateVersionOrm, versionOrm);

      const variableOrms = data.variables.map((v) =>
        this.variableRepository.create({
          id: randomUUID(),
          templateVersionId: newVersionId,
          name: v.name,
          defaultValue: v.defaultValue,
        }),
      );
      if (variableOrms.length > 0) {
        await manager.save(VariableOrm, variableOrms);
      }

      await manager.update(
        TemplateOrm,
        { id: templateId },
        { currentVersion: newVersionNumber },
      );

      const variables = variableOrms.map((vo) =>
        TemplateVariable.reconstitute(vo.id, vo.name, vo.defaultValue),
      );

      return Template.reconstitute({
        id: templateOrm.id,
        name: templateOrm.name,
        tags: data.tags,
        content: data.content,
        variables,
        currentVersion: newVersionNumber,
        createdAt: templateOrm.createdAt,
      });
    });
  }
}
