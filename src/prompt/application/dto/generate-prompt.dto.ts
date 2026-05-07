import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional, IsUUID } from 'class-validator';

export class GeneratePromptDto {
  @ApiProperty({
    description: 'Reference to the template to use',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  readonly templateId: string;

  @ApiProperty({
    description: 'Map of variable names to values for substitution',
    example: { name: 'John Doe' },
    required: false,
    additionalProperties: { type: 'string' },
  })
  @IsOptional()
  @IsObject()
  readonly variables?: Record<string, string>;
}
