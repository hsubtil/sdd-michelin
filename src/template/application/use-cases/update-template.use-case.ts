import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { TemplateWithVersionResponseDto } from '@/template/application/dto/template-with-version-response.dto';
import { UpdateTemplateDto } from '@/template/application/dto/update-template.dto';
import { TemplateResponseMapper } from '@/template/application/mappers/template-response.mapper';
import { IUpdateTemplateUseCase } from '@/template/domain/ports/in/i-update-template.use-case';
import { ITemplateRepository } from '@/template/domain/ports/out/i-template.repository';
import { TEMPLATE_REPOSITORY } from '@/template/template.tokens';

@Injectable()
export class UpdateTemplateUseCase implements IUpdateTemplateUseCase {
  constructor(
    @Inject(TEMPLATE_REPOSITORY)
    private readonly templateRepository: ITemplateRepository,
  ) {}

  async execute(id: string, dto: UpdateTemplateDto): Promise<TemplateWithVersionResponseDto> {
    if (!dto.content && !dto.tags) {
      throw new BadRequestException('At least one of content or tags must be provided');
    }

    const template = await this.templateRepository.findById(id);
    if (!template) {
      throw new NotFoundException(`Template with id '${id}' not found`);
    }

    const newContent = dto.content ?? template.content;
    const newTags = dto.tags ?? [...template.tags];
    const variables = [...template.variables];

    const updated = await this.templateRepository.addNewVersion(id, {
      content: newContent,
      tags: newTags,
      variables,
    });

    return TemplateResponseMapper.toTemplateWithVersionResponse(updated);
  }
}
