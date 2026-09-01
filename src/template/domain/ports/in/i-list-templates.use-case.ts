import { ListTemplatesQueryDto } from '@/template/application/dto/list-templates-query.dto';
import { TemplateSummaryResponseDto } from '@/template/application/dto/template-summary-response.dto';

/**
 * Driving port for listing all templates with their latest version metadata,
 * optionally filtered by name (text search) and/or tags.
 */
export interface IListTemplatesUseCase {
  execute(query?: ListTemplatesQueryDto): Promise<TemplateSummaryResponseDto[]>;
}
