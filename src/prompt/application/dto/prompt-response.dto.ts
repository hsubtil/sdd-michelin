import { ApiProperty } from '@nestjs/swagger';

export class PromptResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the generated prompt',
    format: 'uuid',
    example: '770e8400-e29b-41d4-a716-446655440002',
  })
  readonly id: string;

  @ApiProperty({
    description: 'Reference to the template used',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  readonly templateId: string;

  @ApiProperty({
    description: 'Version number of the template used to generate this prompt',
    minimum: 1,
    example: 2,
  })
  readonly versionUsed: number;

  @ApiProperty({
    description: 'Template content with all variables substituted',
    example: 'Hello John Doe, thank you for being awesome!',
  })
  readonly content: string;

  @ApiProperty({
    description: 'Map of variable names to their resolved values',
    example: { name: 'John Doe' },
    additionalProperties: { type: 'string' },
  })
  readonly variables: Record<string, string>;

  @ApiProperty({
    description: 'Timestamp when prompt was generated (ISO 8601)',
    format: 'date-time',
    example: '2026-05-07T14:45:00Z',
  })
  readonly createdAt: string;

  constructor(
    id: string,
    templateId: string,
    versionUsed: number,
    content: string,
    variables: Record<string, string>,
    createdAt: string,
  ) {
    this.id = id;
    this.templateId = templateId;
    this.versionUsed = versionUsed;
    this.content = content;
    this.variables = variables;
    this.createdAt = createdAt;
  }
}
