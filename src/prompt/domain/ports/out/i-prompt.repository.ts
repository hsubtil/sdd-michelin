import { Prompt } from '@/prompt/domain/entities/prompt.entity';

/**
 * Driven port for prompt persistence operations.
 */
export interface IPromptRepository {
  /** Persist a generated prompt. */
  save(prompt: Prompt): Promise<Prompt>;
}
