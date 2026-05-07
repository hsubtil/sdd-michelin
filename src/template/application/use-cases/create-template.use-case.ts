import { ConflictException, Inject, Injectable } from '@nestjs/common';

import { CreateTemplateResponseDto } from '@/template/application/dto/create-template-response.dto';
import { CreateTemplateDto } from '@/template/application/dto/create-template.dto';
import { TemplateResponseMapper } from '@/template/application/mappers/template-response.mapper';
import { TemplateVariable } from '@/template/domain/entities/template-variable.entity';
import { Template } from '@/template/domain/entities/template.entity';
import { ICreateTemplateUseCase } from '@/template/domain/ports/in/i-create-template.use-case';
import { ITemplateRepository } from '@/template/domain/ports/out/i-template.repository';
import { TEMPLATE_REPOSITORY } from '@/template/template.tokens';

@Injectable()
export class CreateTemplateUseCase implements ICreateTemplateUseCase {
  constructor(
    @Inject(TEMPLATE_REPOSITORY)
    private readonly templateRepository: ITemplateRepository,
  ) {}

  async execute(dto: CreateTemplateDto): Promise<CreateTemplateResponseDto> {
    const existing = await this.templateRepository.findByName(dto.name);
    if (existing) {
      throw new ConflictException(`A template with name '${dto.name}' already exists`);
    }

    const variables = (dto.variables ?? []).map((item) =>
      TemplateVariable.create({
        name: item.name,
        defaultValue: item.defaultValue ?? null,
      }),
    );

    const template = Template.create({
      name: dto.name,
      tags: dto.tags,
      content: dto.content,
      variables,
    });

    const createdTemplate = await this.templateRepository.createTemplateWithInitialVersion(template);
    return TemplateResponseMapper.toCreateTemplateResponse(createdTemplate);
  }
}
