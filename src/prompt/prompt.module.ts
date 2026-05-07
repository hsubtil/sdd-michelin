import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GeneratePromptUseCase } from '@/prompt/application/use-cases/generate-prompt.use-case';
import { PromptController } from '@/prompt/infrastructure/adapters/in/prompt.controller';
import { PromptOrmRepository } from '@/prompt/infrastructure/adapters/out/prompt.orm.repository';
import { PromptOrm } from '@/prompt/infrastructure/persistence/entities/prompt.orm.entity';
import { GENERATE_PROMPT_USE_CASE, PROMPT_REPOSITORY } from '@/prompt/prompt.tokens';
import { TemplateModule } from '@/template/template.module';

@Module({
  imports: [TypeOrmModule.forFeature([PromptOrm]), TemplateModule],
  controllers: [PromptController],
  providers: [
    { provide: PROMPT_REPOSITORY, useClass: PromptOrmRepository },
    { provide: GENERATE_PROMPT_USE_CASE, useClass: GeneratePromptUseCase },
  ],
})
export class PromptModule {}

