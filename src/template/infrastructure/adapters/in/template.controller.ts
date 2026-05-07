import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Inject,
    Param,
    ParseIntPipe,
    ParseUUIDPipe,
    Post,
    Put,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CreateTemplateResponseDto } from '@/template/application/dto/create-template-response.dto';
import { CreateTemplateDto } from '@/template/application/dto/create-template.dto';
import { TemplateVersionResponseDto } from '@/template/application/dto/template-version-response.dto';
import { TemplateWithVersionResponseDto } from '@/template/application/dto/template-with-version-response.dto';
import { UpdateTemplateDto } from '@/template/application/dto/update-template.dto';
import { ICreateTemplateUseCase } from '@/template/domain/ports/in/i-create-template.use-case';
import { IGetTemplateVersionUseCase } from '@/template/domain/ports/in/i-get-template-version.use-case';
import { IGetTemplateVersionsUseCase } from '@/template/domain/ports/in/i-get-template-versions.use-case';
import { IGetTemplateUseCase } from '@/template/domain/ports/in/i-get-template.use-case';
import { IUpdateTemplateUseCase } from '@/template/domain/ports/in/i-update-template.use-case';
import {
    CREATE_TEMPLATE_USE_CASE,
    GET_TEMPLATE_USE_CASE,
    GET_TEMPLATE_VERSION_USE_CASE,
    GET_TEMPLATE_VERSIONS_USE_CASE,
    UPDATE_TEMPLATE_USE_CASE,
} from '@/template/template.tokens';

@ApiTags('Templates')
@Controller('template')
export class TemplateController {
  constructor(
    @Inject(CREATE_TEMPLATE_USE_CASE)
    private readonly createTemplateUseCase: ICreateTemplateUseCase,
    @Inject(GET_TEMPLATE_USE_CASE)
    private readonly getTemplateUseCase: IGetTemplateUseCase,
    @Inject(UPDATE_TEMPLATE_USE_CASE)
    private readonly updateTemplateUseCase: IUpdateTemplateUseCase,
    @Inject(GET_TEMPLATE_VERSIONS_USE_CASE)
    private readonly getTemplateVersionsUseCase: IGetTemplateVersionsUseCase,
    @Inject(GET_TEMPLATE_VERSION_USE_CASE)
    private readonly getTemplateVersionUseCase: IGetTemplateVersionUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new template with initial content' })
  @ApiResponse({ status: 201, description: 'Template created', type: CreateTemplateResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Template name already exists' })
  create(@Body() dto: CreateTemplateDto): Promise<CreateTemplateResponseDto> {
    return this.createTemplateUseCase.execute(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a template with its latest version' })
  @ApiParam({ name: 'id', description: 'Template UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Template retrieved', type: TemplateWithVersionResponseDto })
  @ApiResponse({ status: 404, description: 'Template not found' })
  getTemplate(@Param('id', ParseUUIDPipe) id: string): Promise<TemplateWithVersionResponseDto> {
    return this.getTemplateUseCase.execute(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update template content (creates a new version)' })
  @ApiParam({ name: 'id', description: 'Template UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Template updated', type: TemplateWithVersionResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  updateTemplate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTemplateDto,
  ): Promise<TemplateWithVersionResponseDto> {
    return this.updateTemplateUseCase.execute(id, dto);
  }

  @Get(':id/versions')
  @ApiOperation({ summary: 'Retrieve all versions of a template' })
  @ApiParam({ name: 'id', description: 'Template UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Versions retrieved', type: [TemplateVersionResponseDto] })
  @ApiResponse({ status: 404, description: 'Template not found' })
  getVersions(@Param('id', ParseUUIDPipe) id: string): Promise<TemplateVersionResponseDto[]> {
    return this.getTemplateVersionsUseCase.execute(id);
  }

  @Get(':id/versions/:versionNumber')
  @ApiOperation({ summary: 'Retrieve a specific version of a template' })
  @ApiParam({ name: 'id', description: 'Template UUID', format: 'uuid' })
  @ApiParam({ name: 'versionNumber', description: 'Version number', type: Number })
  @ApiResponse({ status: 200, description: 'Version retrieved', type: TemplateVersionResponseDto })
  @ApiResponse({ status: 404, description: 'Template or version not found' })
  getVersion(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('versionNumber', ParseIntPipe) versionNumber: number,
  ): Promise<TemplateVersionResponseDto> {
    return this.getTemplateVersionUseCase.execute(id, versionNumber);
  }
}
