import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreateTemplateUseCase } from '@/template/application/use-cases/create-template.use-case';
import { GetTemplateVersionUseCase } from '@/template/application/use-cases/get-template-version.use-case';
import { GetTemplateVersionsUseCase } from '@/template/application/use-cases/get-template-versions.use-case';
import { GetTemplateUseCase } from '@/template/application/use-cases/get-template.use-case';
import { ListTemplatesUseCase } from '@/template/application/use-cases/list-templates.use-case';
import { UpdateTemplateUseCase } from '@/template/application/use-cases/update-template.use-case';
import { TemplateController } from '@/template/infrastructure/adapters/in/template.controller';
import { TemplateOrmRepository } from '@/template/infrastructure/adapters/out/template.orm.repository';
import { TemplateVersionOrm } from '@/template/infrastructure/persistence/entities/template-version.orm.entity';
import { TemplateOrm } from '@/template/infrastructure/persistence/entities/template.orm.entity';
import { VariableOrm } from '@/template/infrastructure/persistence/entities/variable.orm.entity';
import {
  CREATE_TEMPLATE_USE_CASE,
  GET_TEMPLATE_USE_CASE,
  GET_TEMPLATE_VERSION_USE_CASE,
  GET_TEMPLATE_VERSIONS_USE_CASE,
  LIST_TEMPLATES_USE_CASE,
  TEMPLATE_REPOSITORY,
  UPDATE_TEMPLATE_USE_CASE,
} from '@/template/template.tokens';

@Module({
  imports: [
    TypeOrmModule.forFeature([TemplateOrm, TemplateVersionOrm, VariableOrm]),
  ],
  controllers: [TemplateController],
  providers: [
    { provide: TEMPLATE_REPOSITORY, useClass: TemplateOrmRepository },
    { provide: CREATE_TEMPLATE_USE_CASE, useClass: CreateTemplateUseCase },
    { provide: GET_TEMPLATE_USE_CASE, useClass: GetTemplateUseCase },
    { provide: LIST_TEMPLATES_USE_CASE, useClass: ListTemplatesUseCase },
    { provide: UPDATE_TEMPLATE_USE_CASE, useClass: UpdateTemplateUseCase },
    {
      provide: GET_TEMPLATE_VERSIONS_USE_CASE,
      useClass: GetTemplateVersionsUseCase,
    },
    {
      provide: GET_TEMPLATE_VERSION_USE_CASE,
      useClass: GetTemplateVersionUseCase,
    },
  ],
  exports: [TEMPLATE_REPOSITORY],
})
export class TemplateModule {}
