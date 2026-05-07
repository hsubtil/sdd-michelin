import { ApiProperty } from '@nestjs/swagger';

import { CreateTemplateResponseDto } from '@/template/application/dto/create-template-response.dto';
import { VariableResponseDto } from '@/template/application/dto/variable-response.dto';

export class TemplateWithVersionResponseDto extends CreateTemplateResponseDto {
  @ApiProperty({
    description: 'Template content with variable placeholders',
    example: 'Hello {{name}}, thank you for your business!',
  })
  readonly content: string;

  @ApiProperty({
    description: 'List of variables defined in the current version',
    type: [VariableResponseDto],
  })
  readonly variables: VariableResponseDto[];

  constructor(
    id: string,
    name: string,
    tags: string[],
    currentVersion: number,
    createdAt: string,
    content: string,
    variables: VariableResponseDto[],
  ) {
    super(id, name, tags, currentVersion, createdAt);
    this.content = content;
    this.variables = variables;
  }
}
