import { ValidationPipe } from '@nestjs/common';
import { INestApplication } from '@nestjs/common/interfaces';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { ProblemDetailsFilter } from '@/common/filters/problem-details.filter';
import { CreateTemplateUseCase } from '@/template/application/use-cases/create-template.use-case';
import { Template } from '@/template/domain/entities/template.entity';
import { ITemplateRepository } from '@/template/domain/ports/out/i-template.repository';
import { TemplateController } from '@/template/infrastructure/adapters/in/template.controller';
import { CREATE_TEMPLATE_USE_CASE, TEMPLATE_REPOSITORY } from '@/template/template.tokens';

describe('TemplateController (e2e)', () => {
  let app: INestApplication;

  const repositoryState = new Map<string, string>();
  const repositoryMock: ITemplateRepository = {
    findByName: jest.fn(async (name: string) => {
      if (!repositoryState.has(name)) {
        return null;
      }

      return Template.create({
        name,
        tags: ['email'],
        content: 'Hello {{name}}',
        variables: [],
      });
    }),
    createTemplateWithInitialVersion: jest.fn(async (template) => {
      repositoryState.set(template.name, template.id);
      return template;
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TemplateController],
      providers: [
        {
          provide: TEMPLATE_REPOSITORY,
          useValue: repositoryMock,
        },
        {
          provide: CREATE_TEMPLATE_USE_CASE,
          useClass: CreateTemplateUseCase,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new ProblemDetailsFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates a template', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/template')
      .send({
        name: 'Customer Email',
        tags: ['email', 'customer'],
        content: 'Hello {{name}}',
        variables: [{ name: 'name', defaultValue: 'Customer' }],
      })
      .expect(201);

    expect(response.body.name).toBe('Customer Email');
    expect(response.body.currentVersion).toBe(1);
  });

  it('returns validation error on invalid body', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/template')
      .send({
        name: '',
        tags: [],
        content: '',
      })
      .expect(400);
  });

  it('returns conflict when template name already exists', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/template')
      .send({
        name: 'Customer Email',
        tags: ['email', 'customer'],
        content: 'Hello {{name}}',
      })
      .expect(409);
  });
});
