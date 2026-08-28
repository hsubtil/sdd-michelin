import { Inject, Injectable } from '@nestjs/common';

import { TemplateSummaryResponseDto } from '@/template/application/dto/template-summary-response.dto';
import { TemplateResponseMapper } from '@/template/application/mappers/template-response.mapper';
import { IListTemplatesUseCase } from '@/template/domain/ports/in/i-list-templates.use-case';
import { ITemplateRepository } from '@/template/domain/ports/out/i-template.repository';
import { TEMPLATE_REPOSITORY } from '@/template/template.tokens';

@Injectable()
export class ListTemplatesUseCase implements IListTemplatesUseCase {
  constructor(
    @Inject(TEMPLATE_REPOSITORY)
    private readonly templateRepository: ITemplateRepository,
  ) {}

  async execute(): Promise<TemplateSummaryResponseDto[]> {
    const templates = await this.templateRepository.findAll();
    return templates.map((template) =>
      TemplateResponseMapper.toTemplateSummaryResponse(template),
    );
  }
}
