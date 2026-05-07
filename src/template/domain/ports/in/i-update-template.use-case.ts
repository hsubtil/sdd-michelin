import { TemplateWithVersionResponseDto } from '@/template/application/dto/template-with-version-response.dto';
import { UpdateTemplateDto } from '@/template/application/dto/update-template.dto';

/**
 * Driving port for updating a template by creating a new version.
 */
export interface IUpdateTemplateUseCase {
  execute(id: string, dto: UpdateTemplateDto): Promise<TemplateWithVersionResponseDto>;
}
