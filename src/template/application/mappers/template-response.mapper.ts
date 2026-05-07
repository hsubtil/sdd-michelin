import { CreateTemplateResponseDto } from '@/template/application/dto/create-template-response.dto';
import { TemplateVersionResponseDto } from '@/template/application/dto/template-version-response.dto';
import { TemplateWithVersionResponseDto } from '@/template/application/dto/template-with-version-response.dto';
import { VariableResponseDto } from '@/template/application/dto/variable-response.dto';
import { TemplateVersion } from '@/template/domain/entities/template-version.entity';
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

  static toTemplateWithVersionResponse(template: Template): TemplateWithVersionResponseDto {
    const variables = template.variables.map(
      (v) => new VariableResponseDto(v.id, v.name, v.defaultValue),
    );
    return new TemplateWithVersionResponseDto(
      template.id,
      template.name,
      [...template.tags],
      template.currentVersion,
      template.createdAt.toISOString(),
      template.content,
      variables,
    );
  }

  static toTemplateVersionResponse(version: TemplateVersion): TemplateVersionResponseDto {
    const variables = version.variables.map(
      (v) => new VariableResponseDto(v.id, v.name, v.defaultValue),
    );
    return new TemplateVersionResponseDto(
      version.versionNumber,
      version.templateId,
      version.content,
      variables,
      [...version.tags],
      version.createdAt.toISOString(),
    );
  }
}
