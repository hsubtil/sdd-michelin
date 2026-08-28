import { TemplateSummaryResponseDto } from '@/template/application/dto/template-summary-response.dto';

/**
 * Driving port for listing all templates with their latest version metadata.
 */
export interface IListTemplatesUseCase {
  execute(): Promise<TemplateSummaryResponseDto[]>;
}
