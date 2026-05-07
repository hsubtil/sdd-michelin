import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { TemplateVersionResponseDto } from '@/template/application/dto/template-version-response.dto';
import { TemplateResponseMapper } from '@/template/application/mappers/template-response.mapper';
import { IGetTemplateVersionsUseCase } from '@/template/domain/ports/in/i-get-template-versions.use-case';
import { ITemplateRepository } from '@/template/domain/ports/out/i-template.repository';
import { TEMPLATE_REPOSITORY } from '@/template/template.tokens';

@Injectable()
export class GetTemplateVersionsUseCase implements IGetTemplateVersionsUseCase {
  constructor(
    @Inject(TEMPLATE_REPOSITORY)
    private readonly templateRepository: ITemplateRepository,
  ) {}

  async execute(templateId: string): Promise<TemplateVersionResponseDto[]> {
    const template = await this.templateRepository.findById(templateId);
    if (!template) {
      throw new NotFoundException(`Template with id '${templateId}' not found`);
    }

    const versions = await this.templateRepository.findVersionsByTemplateId(templateId);
    return versions.map((v) => TemplateResponseMapper.toTemplateVersionResponse(v));
  }
}
