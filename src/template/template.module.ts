import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreateTemplateUseCase } from '@/template/application/use-cases/create-template.use-case';
import { TemplateController } from '@/template/infrastructure/adapters/in/template.controller';
import { TemplateOrmRepository } from '@/template/infrastructure/adapters/out/template.orm.repository';
import { TemplateVersionOrm } from '@/template/infrastructure/persistence/entities/template-version.orm.entity';
import { TemplateOrm } from '@/template/infrastructure/persistence/entities/template.orm.entity';
import { VariableOrm } from '@/template/infrastructure/persistence/entities/variable.orm.entity';
import { CREATE_TEMPLATE_USE_CASE, TEMPLATE_REPOSITORY } from '@/template/template.tokens';

@Module({
  imports: [TypeOrmModule.forFeature([TemplateOrm, TemplateVersionOrm, VariableOrm])],
  controllers: [TemplateController],
  providers: [
    {
      provide: TEMPLATE_REPOSITORY,
      useClass: TemplateOrmRepository,
    },
    {
      provide: CREATE_TEMPLATE_USE_CASE,
      useClass: CreateTemplateUseCase,
    },
  ],
  exports: [CREATE_TEMPLATE_USE_CASE],
})
export class TemplateModule {}
