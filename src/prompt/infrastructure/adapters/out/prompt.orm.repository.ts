import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Prompt } from '@/prompt/domain/entities/prompt.entity';
import { IPromptRepository } from '@/prompt/domain/ports/out/i-prompt.repository';
import { PromptOrm } from '@/prompt/infrastructure/persistence/entities/prompt.orm.entity';

@Injectable()
export class PromptOrmRepository implements IPromptRepository {
  constructor(
    @InjectRepository(PromptOrm)
    private readonly promptRepository: Repository<PromptOrm>,
  ) {}

  async save(prompt: Prompt): Promise<Prompt> {
    const orm = this.promptRepository.create({
      id: prompt.id,
      templateId: prompt.templateId,
      versionUsed: prompt.versionUsed,
      content: prompt.content,
      variables: prompt.variables,
      createdAt: prompt.createdAt,
    });
    await this.promptRepository.save(orm);
    return prompt;
  }
}
