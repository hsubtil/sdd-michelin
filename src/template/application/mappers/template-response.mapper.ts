import { CreateTemplateResponseDto } from '@/template/application/dto/create-template-response.dto';
import { Template } from '@/template/domain/entities/template.entity';

export class TemplateResponseMapper {
  static toCreateTemplateResponse(template: Template): CreateTemplateResponseDto {
    return new CreateTemplateResponseDto(
      template.id,
      template.name,
      [...template.tags],
      template.currentVersion,
      template.createdAt.toISOString(),
    );
  }
}
