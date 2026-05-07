import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { TemplateWithVersionResponseDto } from '@/template/application/dto/template-with-version-response.dto';
import { TemplateResponseMapper } from '@/template/application/mappers/template-response.mapper';
import { IGetTemplateUseCase } from '@/template/domain/ports/in/i-get-template.use-case';
import { ITemplateRepository } from '@/template/domain/ports/out/i-template.repository';
import { TEMPLATE_REPOSITORY } from '@/template/template.tokens';

@Injectable()
export class GetTemplateUseCase implements IGetTemplateUseCase {
  constructor(
    @Inject(TEMPLATE_REPOSITORY)
    private readonly templateRepository: ITemplateRepository,
  ) {}

  async execute(id: string): Promise<TemplateWithVersionResponseDto> {
    const template = await this.templateRepository.findById(id);
    if (!template) {
      throw new NotFoundException(`Template with id '${id}' not found`);
    }
    return TemplateResponseMapper.toTemplateWithVersionResponse(template);
  }
}
