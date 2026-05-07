import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PromptOrm } from '@/prompt/infrastructure/persistence/entities/prompt.orm.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PromptOrm])],
})
export class PromptModule {}
