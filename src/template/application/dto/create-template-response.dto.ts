import { ApiProperty } from '@nestjs/swagger';

export class CreateTemplateResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the template',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  readonly id: string;

  @ApiProperty({
    description: 'Template name',
    maxLength: 50,
    example: 'Customer Email',
  })
  readonly name: string;

  @ApiProperty({
    description: 'Array of tag labels',
    isArray: true,
    example: ['email', 'customer'],
  })
  readonly tags: string[];

  @ApiProperty({
    description: 'Version number of the latest version',
    minimum: 1,
    example: 1,
  })
  readonly currentVersion: number;

  @ApiProperty({
    description: 'Timestamp when template was created (ISO 8601)',
    format: 'date-time',
    example: '2026-05-07T10:30:00Z',
  })
  readonly createdAt: string;

  constructor(
    id: string,
    name: string,
    tags: string[],
    currentVersion: number,
    createdAt: string,
  ) {
    this.id = id;
    this.name = name;
    this.tags = tags;
    this.currentVersion = currentVersion;
    this.createdAt = createdAt;
  }
}
