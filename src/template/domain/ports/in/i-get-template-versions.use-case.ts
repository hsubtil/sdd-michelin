import { TemplateVersionResponseDto } from '@/template/application/dto/template-version-response.dto';

/**
 * Driving port for retrieving all versions of a template.
 */
export interface IGetTemplateVersionsUseCase {
  execute(templateId: string): Promise<TemplateVersionResponseDto[]>;
}
