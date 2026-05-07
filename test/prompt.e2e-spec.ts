import { ValidationPipe } from '@nestjs/common';
import { INestApplication } from '@nestjs/common/interfaces';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { ProblemDetailsFilter } from '@/common/filters/problem-details.filter';
import { GeneratePromptUseCase } from '@/prompt/application/use-cases/generate-prompt.use-case';
import { Prompt } from '@/prompt/domain/entities/prompt.entity';
import { IPromptRepository } from '@/prompt/domain/ports/out/i-prompt.repository';
import { PromptController } from '@/prompt/infrastructure/adapters/in/prompt.controller';
import { GENERATE_PROMPT_USE_CASE, PROMPT_REPOSITORY } from '@/prompt/prompt.tokens';
import { TemplateVariable } from '@/template/domain/entities/template-variable.entity';
import { Template } from '@/template/domain/entities/template.entity';
import { ITemplateRepository } from '@/template/domain/ports/out/i-template.repository';
import { TEMPLATE_REPOSITORY } from '@/template/template.tokens';

describe('PromptController (e2e)', () => {
  let app: INestApplication;

  const templateId = '550e8400-e29b-41d4-a716-446655440000';
  const mockTemplate = Template.reconstitute({
    id: templateId,
    name: 'Test Template',
    tags: ['test'],
    content: 'Hello {{name}}, welcome to {{company}}!',
    variables: [
      TemplateVariable.create({ name: 'name', defaultValue: 'Customer' }),
      TemplateVariable.create({ name: 'company', defaultValue: 'Acme' }),
    ],
    currentVersion: 1,
    createdAt: new Date(),
  });

  const templateRepoMock: ITemplateRepository = {
    findByName: jest.fn(),
    findById: jest.fn(async (id: string) => (id === templateId ? mockTemplate : null)),
    createTemplateWithInitialVersion: jest.fn(),
    addNewVersion: jest.fn(),
    findVersionsByTemplateId: jest.fn(),
    findVersionByNumber: jest.fn(),
  };

  const promptRepoMock: IPromptRepository = {
    save: jest.fn(async (p: Prompt) => p),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [PromptController],
      providers: [
        { provide: TEMPLATE_REPOSITORY, useValue: templateRepoMock },
        { provide: PROMPT_REPOSITORY, useValue: promptRepoMock },
        { provide: GENERATE_PROMPT_USE_CASE, useClass: GeneratePromptUseCase },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new ProblemDetailsFilter());
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /prompt — generates a prompt with provided variables', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/prompt')
      .send({ templateId, variables: { name: 'John', company: 'MyCorp' } })
      .expect(200);

    expect(response.body.content).toBe('Hello John, welcome to MyCorp!');
    expect(response.body.versionUsed).toBe(1);
    expect(response.body.templateId).toBe(templateId);
  });

  it('POST /prompt — uses default values for missing variables', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/prompt')
      .send({ templateId, variables: { name: 'Jane' } })
      .expect(200);

    expect(response.body.content).toBe('Hello Jane, welcome to Acme!');
  });

  it('POST /prompt — returns 404 when template not found', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/prompt')
      .send({ templateId: '00000000-0000-0000-0000-000000000000' })
      .expect(404);
  });

  it('POST /prompt — returns 400 on invalid payload', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/prompt')
      .send({ templateId: 'not-a-uuid' })
      .expect(400);
  });
});
