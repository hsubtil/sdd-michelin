import { ApiProperty } from '@nestjs/swagger';

export class VariableResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the variable',
    format: 'uuid',
    example: '660e8400-e29b-41d4-a716-446655440001',
  })
  readonly id: string;

  @ApiProperty({
    description: 'Variable name used for substitution in template content',
    example: 'firstName',
  })
  readonly name: string;

  @ApiProperty({
    description: 'Optional default value used if not provided at prompt generation time',
    nullable: true,
    example: 'Customer',
  })
  readonly defaultValue: string | null;

  constructor(id: string, name: string, defaultValue: string | null) {
    this.id = id;
    this.name = name;
    this.defaultValue = defaultValue;
  }
}
