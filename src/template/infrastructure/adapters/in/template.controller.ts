import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Inject,
    Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CreateTemplateResponseDto } from '@/template/application/dto/create-template-response.dto';
import { CreateTemplateDto } from '@/template/application/dto/create-template.dto';
import { ICreateTemplateUseCase } from '@/template/domain/ports/in/i-create-template.use-case';
import { CREATE_TEMPLATE_USE_CASE } from '@/template/template.tokens';

@ApiTags('Templates')
@Controller('template')
export class TemplateController {
  constructor(
    @Inject(CREATE_TEMPLATE_USE_CASE)
    private readonly createTemplateUseCase: ICreateTemplateUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new template with initial content' })
  @ApiResponse({
    status: 201,
    description: 'Template created successfully',
    type: CreateTemplateResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Template already exists with this name' })
  create(@Body() dto: CreateTemplateDto): Promise<CreateTemplateResponseDto> {
    return this.createTemplateUseCase.execute(dto);
  }
}
