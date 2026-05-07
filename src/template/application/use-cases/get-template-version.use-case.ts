import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { TemplateVersionResponseDto } from '@/template/application/dto/template-version-response.dto';
import { TemplateResponseMapper } from '@/template/application/mappers/template-response.mapper';
import { IGetTemplateVersionUseCase } from '@/template/domain/ports/in/i-get-template-version.use-case';
import { ITemplateRepository } from '@/template/domain/ports/out/i-template.repository';
import { TEMPLATE_REPOSITORY } from '@/template/template.tokens';

@Injectable()
export class GetTemplateVersionUseCase implements IGetTemplateVersionUseCase {
  constructor(
    @Inject(TEMPLATE_REPOSITORY)
    private readonly templateRepository: ITemplateRepository,
  ) {}

  async execute(templateId: string, versionNumber: number): Promise<TemplateVersionResponseDto> {
    const template = await this.templateRepository.findById(templateId);
    if (!template) {
      throw new NotFoundException(`Template with id '${templateId}' not found`);
    }

    const version = await this.templateRepository.findVersionByNumber(templateId, versionNumber);
    if (!version) {
      throw new NotFoundException(
        `Version ${versionNumber} not found for template '${templateId}'`,
      );
    }

    return TemplateResponseMapper.toTemplateVersionResponse(version);
  }
}
