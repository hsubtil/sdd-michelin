import { TemplateVersionResponseDto } from '@/template/application/dto/template-version-response.dto';

/**
 * Driving port for retrieving a specific version of a template.
 */
export interface IGetTemplateVersionUseCase {
  execute(templateId: string, versionNumber: number): Promise<TemplateVersionResponseDto>;
}
