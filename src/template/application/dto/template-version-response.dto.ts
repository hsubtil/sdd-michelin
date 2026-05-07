import { ApiProperty } from '@nestjs/swagger';

import { VariableResponseDto } from '@/template/application/dto/variable-response.dto';

export class TemplateVersionResponseDto {
  @ApiProperty({
    description: 'Version number within the template (starting from 1)',
    minimum: 1,
    example: 2,
  })
  readonly versionNumber: number;

  @ApiProperty({
    description: 'Reference to the parent template',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  readonly templateId: string;

  @ApiProperty({
    description: 'Template content at this version',
    example: 'Hello {{name}}, thank you for being awesome!',
  })
  readonly content: string;

  @ApiProperty({
    description: 'List of variables defined in this version',
    type: [VariableResponseDto],
  })
  readonly variables: VariableResponseDto[];

  @ApiProperty({
    description: 'Tags assigned in this version',
    isArray: true,
    example: ['email', 'customer'],
  })
  readonly tags: string[];

  @ApiProperty({
    description: 'Timestamp when version was created (ISO 8601)',
    format: 'date-time',
    example: '2026-05-07T11:00:00Z',
  })
  readonly createdAt: string;

  constructor(
    versionNumber: number,
    templateId: string,
    content: string,
    variables: VariableResponseDto[],
    tags: string[],
    createdAt: string,
  ) {
    this.versionNumber = versionNumber;
    this.templateId = templateId;
    this.content = content;
    this.variables = variables;
    this.tags = tags;
    this.createdAt = createdAt;
  }
}
