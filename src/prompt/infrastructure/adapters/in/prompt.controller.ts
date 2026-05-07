import { Body, Controller, HttpCode, HttpStatus, Inject, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { GeneratePromptDto } from '@/prompt/application/dto/generate-prompt.dto';
import { PromptResponseDto } from '@/prompt/application/dto/prompt-response.dto';
import { IGeneratePromptUseCase } from '@/prompt/domain/ports/in/i-generate-prompt.use-case';
import { GENERATE_PROMPT_USE_CASE } from '@/prompt/prompt.tokens';

@ApiTags('Prompts')
@Controller('prompt')
export class PromptController {
  constructor(
    @Inject(GENERATE_PROMPT_USE_CASE)
    private readonly generatePromptUseCase: IGeneratePromptUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate a new prompt from a template' })
  @ApiResponse({ status: 200, description: 'Prompt generated successfully', type: PromptResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error or missing required variables' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  generate(@Body() dto: GeneratePromptDto): Promise<PromptResponseDto> {
    return this.generatePromptUseCase.execute(dto);
  }
}
