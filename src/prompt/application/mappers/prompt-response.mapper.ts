import { PromptResponseDto } from '@/prompt/application/dto/prompt-response.dto';
import { Prompt } from '@/prompt/domain/entities/prompt.entity';

export class PromptResponseMapper {
  static toPromptResponse(prompt: Prompt): PromptResponseDto {
    return new PromptResponseDto(
      prompt.id,
      prompt.templateId,
      prompt.versionUsed,
      prompt.content,
      { ...prompt.variables },
      prompt.createdAt.toISOString(),
    );
  }
}
