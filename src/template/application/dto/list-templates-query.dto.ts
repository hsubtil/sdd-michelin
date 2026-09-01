import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class ListTemplatesQueryDto {
  @ApiPropertyOptional({
    description:
      'Text search on template name (case-insensitive, partial match)',
    example: 'customer',
  })
  @IsOptional()
  @IsString()
  readonly name?: string;

  @ApiPropertyOptional({
    description:
      'Comma-separated list of tags to filter by (matches templates having at least one)',
    type: String,
    example: 'email,customer',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    Array.isArray(value)
      ? value
      : typeof value === 'string'
        ? value
            .split(',')
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0)
        : value,
  )
  @IsString({ each: true })
  readonly tags?: string[];
}
