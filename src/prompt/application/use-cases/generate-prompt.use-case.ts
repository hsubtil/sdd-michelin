import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { GeneratePromptDto } from '@/prompt/application/dto/generate-prompt.dto';
import { PromptResponseDto } from '@/prompt/application/dto/prompt-response.dto';
import { PromptResponseMapper } from '@/prompt/application/mappers/prompt-response.mapper';
import { Prompt } from '@/prompt/domain/entities/prompt.entity';
import { IGeneratePromptUseCase } from '@/prompt/domain/ports/in/i-generate-prompt.use-case';
import { IPromptRepository } from '@/prompt/domain/ports/out/i-prompt.repository';
import { PROMPT_REPOSITORY } from '@/prompt/prompt.tokens';
import { ITemplateRepository } from '@/template/domain/ports/out/i-template.repository';
import { TEMPLATE_REPOSITORY } from '@/template/template.tokens';

@Injectable()
export class GeneratePromptUseCase implements IGeneratePromptUseCase {
  constructor(
    @Inject(TEMPLATE_REPOSITORY)
    private readonly templateRepository: ITemplateRepository,
    @Inject(PROMPT_REPOSITORY)
    private readonly promptRepository: IPromptRepository,
  ) {}

  async execute(dto: GeneratePromptDto): Promise<PromptResponseDto> {
    const template = await this.templateRepository.findById(dto.templateId);
    if (!template) {
      throw new NotFoundException(`Template with id '${dto.templateId}' not found`);
    }

    const provided = dto.variables ?? {};
    const resolved: Record<string, string> = {};
    const missing: string[] = [];

    for (const variable of template.variables) {
      if (variable.name in provided) {
        resolved[variable.name] = provided[variable.name];
      } else if (variable.defaultValue !== null) {
        resolved[variable.name] = variable.defaultValue;
      } else {
        missing.push(variable.name);
      }
    }

    if (missing.length > 0) {
      throw new BadRequestException(`Missing required variables: ${missing.join(', ')}`);
    }

    let content = template.content;
    for (const [name, value] of Object.entries(resolved)) {
      content = content.replaceAll(`{{${name}}}`, value);
    }

    const prompt = Prompt.create({
      templateId: template.id,
      versionUsed: template.currentVersion,
      content,
      variables: resolved,
    });

    const saved = await this.promptRepository.save(prompt);
    return PromptResponseMapper.toPromptResponse(saved);
  }
}
