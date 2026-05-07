import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateTemplateDto {
  @ApiProperty({
    description: 'New template content (creates new version if provided)',
    example: 'Hey {{name}}, thanks for sticking with us!',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly content?: string;

  @ApiProperty({
    description: 'Updated tag labels',
    example: ['email', 'customer', 'retention'],
    isArray: true,
    minItems: 1,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  readonly tags?: string[];
}
