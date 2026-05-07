import { CreateTemplateResponseDto } from '@/template/application/dto/create-template-response.dto';
import { CreateTemplateDto } from '@/template/application/dto/create-template.dto';

/**
 * Driving port for creating a prompt template with initial version.
 */
export interface ICreateTemplateUseCase {
  execute(dto: CreateTemplateDto): Promise<CreateTemplateResponseDto>;
}
