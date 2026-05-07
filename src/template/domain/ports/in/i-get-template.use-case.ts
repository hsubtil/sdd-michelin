import { TemplateWithVersionResponseDto } from '@/template/application/dto/template-with-version-response.dto';

/**
 * Driving port for retrieving a template with its current version content.
 */
export interface IGetTemplateUseCase {
  execute(id: string): Promise<TemplateWithVersionResponseDto>;
}
