import { GeneratePromptDto } from '@/prompt/application/dto/generate-prompt.dto';
import { PromptResponseDto } from '@/prompt/application/dto/prompt-response.dto';

/**
 * Driving port for generating a prompt from a template with variable substitution.
 */
export interface IGeneratePromptUseCase {
  execute(dto: GeneratePromptDto): Promise<PromptResponseDto>;
}
