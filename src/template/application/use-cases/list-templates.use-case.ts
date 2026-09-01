import { Inject, Injectable } from '@nestjs/common';

import { ListTemplatesQueryDto } from '@/template/application/dto/list-templates-query.dto';
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

  async execute(
    query?: ListTemplatesQueryDto,
  ): Promise<TemplateSummaryResponseDto[]> {
    const templates = await this.templateRepository.findAll({
      name: query?.name,
      tags: query?.tags,
    });
    return templates.map((template) =>
      TemplateResponseMapper.toTemplateSummaryResponse(template),
    );
  }
}
