import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    ValidateNested,
} from 'class-validator';

export class CreateTemplateVariableDto {
  @ApiProperty({
    description: 'Variable name (must be unique within template)',
    example: 'name',
  })
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty({
    description: 'Optional default value',
    example: 'Customer',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  readonly defaultValue?: string | null;
}

export class CreateTemplateDto {
  @ApiProperty({
    description: 'Template name (must be unique, max 50 characters)',
    example: 'Customer Email',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  readonly name: string;

  @ApiProperty({
    description: 'Array of tag labels for categorization',
    example: ['email', 'customer'],
    isArray: true,
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  readonly tags: string[];

  @ApiProperty({
    description: 'Template content with optional variable placeholders',
    example: 'Hello {{name}}, thank you for your business!',
  })
  @IsString()
  @IsNotEmpty()
  readonly content: string;

  @ApiProperty({
    description: 'Array of variables used in the template',
    type: CreateTemplateVariableDto,
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTemplateVariableDto)
  readonly variables?: CreateTemplateVariableDto[];
}
