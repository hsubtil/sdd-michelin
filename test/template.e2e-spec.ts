import { ValidationPipe } from '@nestjs/common';
import { INestApplication } from '@nestjs/common/interfaces';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { ProblemDetailsFilter } from '@/common/filters/problem-details.filter';
import { CreateTemplateUseCase } from '@/template/application/use-cases/create-template.use-case';
import { GetTemplateVersionUseCase } from '@/template/application/use-cases/get-template-version.use-case';
import { GetTemplateVersionsUseCase } from '@/template/application/use-cases/get-template-versions.use-case';
import { GetTemplateUseCase } from '@/template/application/use-cases/get-template.use-case';
import { ListTemplatesUseCase } from '@/template/application/use-cases/list-templates.use-case';
import { UpdateTemplateUseCase } from '@/template/application/use-cases/update-template.use-case';
import { TemplateVariable } from '@/template/domain/entities/template-variable.entity';
import { TemplateVersion } from '@/template/domain/entities/template-version.entity';
import { Template } from '@/template/domain/entities/template.entity';
import {
  ITemplateRepository,
  TemplateSearchCriteria,
} from '@/template/domain/ports/out/i-template.repository';
import { TemplateController } from '@/template/infrastructure/adapters/in/template.controller';
import {
  CREATE_TEMPLATE_USE_CASE,
  GET_TEMPLATE_USE_CASE,
  GET_TEMPLATE_VERSION_USE_CASE,
  GET_TEMPLATE_VERSIONS_USE_CASE,
  LIST_TEMPLATES_USE_CASE,
  TEMPLATE_REPOSITORY,
  UPDATE_TEMPLATE_USE_CASE,
} from '@/template/template.tokens';

describe('TemplateController (e2e)', () => {
  let app: INestApplication;

  const templateStore = new Map<string, Template>();
  const nameIndex = new Map<string, string>();

  const repositoryMock: ITemplateRepository = {
    findByName: jest.fn(
      async (name: string) =>
        templateStore.get(nameIndex.get(name) ?? '') ?? null,
    ),
    findById: jest.fn(async (id: string) => templateStore.get(id) ?? null),
    createTemplateWithInitialVersion: jest.fn(async (template: Template) => {
      templateStore.set(template.id, template);
      nameIndex.set(template.name, template.id);
      return template;
    }),
    addNewVersion: jest.fn(async (templateId: string, data) => {
      const existing = templateStore.get(templateId);
      if (!existing) throw new Error('Template not found');
      const variables = data.variables.map((v) =>
        TemplateVariable.reconstitute(v.id, v.name, v.defaultValue),
      );
      const updated = Template.reconstitute({
        id: existing.id,
        name: existing.name,
        tags: data.tags,
        content: data.content,
        variables,
        currentVersion: existing.currentVersion + 1,
        createdAt: existing.createdAt,
      });
      templateStore.set(templateId, updated);
      return updated;
    }),
    findVersionsByTemplateId: jest.fn(async (templateId: string) => {
      const tmpl = templateStore.get(templateId);
      if (!tmpl) return [];
      return [
        TemplateVersion.reconstitute({
          id: 'version-id',
          templateId,
          versionNumber: tmpl.currentVersion,
          content: tmpl.content,
          tags: [...tmpl.tags],
          variables: [...tmpl.variables].map((v) =>
            TemplateVariable.reconstitute(v.id, v.name, v.defaultValue),
          ),
          createdAt: tmpl.createdAt,
        }),
      ];
    }),
    findVersionByNumber: jest.fn(
      async (templateId: string, versionNumber: number) => {
        const tmpl = templateStore.get(templateId);
        if (!tmpl || tmpl.currentVersion !== versionNumber) return null;
        return TemplateVersion.reconstitute({
          id: 'version-id',
          templateId,
          versionNumber,
          content: tmpl.content,
          tags: [...tmpl.tags],
          variables: [...tmpl.variables].map((v) =>
            TemplateVariable.reconstitute(v.id, v.name, v.defaultValue),
          ),
          createdAt: tmpl.createdAt,
        });
      },
    ),
    findAll: jest.fn(async (criteria?: TemplateSearchCriteria) => {
      let templates = [...templateStore.values()];
      if (criteria?.name) {
        const search = criteria.name.toLowerCase();
        templates = templates.filter((t) =>
          t.name.toLowerCase().includes(search),
        );
      }
      if (criteria?.tags && criteria.tags.length > 0) {
        const wanted = new Set(criteria.tags);
        templates = templates.filter((t) =>
          t.tags.some((tag) => wanted.has(tag)),
        );
      }
      return templates;
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TemplateController],
      providers: [
        { provide: TEMPLATE_REPOSITORY, useValue: repositoryMock },
        { provide: CREATE_TEMPLATE_USE_CASE, useClass: CreateTemplateUseCase },
        { provide: GET_TEMPLATE_USE_CASE, useClass: GetTemplateUseCase },
        { provide: UPDATE_TEMPLATE_USE_CASE, useClass: UpdateTemplateUseCase },
        {
          provide: GET_TEMPLATE_VERSIONS_USE_CASE,
          useClass: GetTemplateVersionsUseCase,
        },
        {
          provide: GET_TEMPLATE_VERSION_USE_CASE,
          useClass: GetTemplateVersionUseCase,
        },
        { provide: LIST_TEMPLATES_USE_CASE, useClass: ListTemplatesUseCase },
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

  let createdTemplateId: string;

  it('POST /template — creates a template', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/template')
      .send({
        name: 'E2E Template',
        tags: ['e2e'],
        content: 'Hello {{name}}',
        variables: [{ name: 'name', defaultValue: 'World' }],
      })
      .expect(201);

    expect(response.body.name).toBe('E2E Template');
    expect(response.body.currentVersion).toBe(1);
    createdTemplateId = response.body.id as string;
  });

  it('POST /template — returns 400 on invalid body', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/template')
      .send({ name: '', tags: [], content: '' })
      .expect(400);
  });

  it('POST /template — returns 409 on duplicate name', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/template')
      .send({ name: 'E2E Template', tags: ['e2e'], content: 'Hello' })
      .expect(409);
  });

  it('GET /template/:id — retrieves template with content and variables', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/template/${createdTemplateId}`)
      .expect(200);

    expect(response.body.id).toBe(createdTemplateId);
    expect(response.body.content).toBe('Hello {{name}}');
    expect(Array.isArray(response.body.variables)).toBe(true);
  });

  it('GET /template/:id — returns 404 for unknown id', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/template/00000000-0000-0000-0000-000000000000')
      .expect(404);
  });

  it('PUT /template/:id — creates a new version', async () => {
    const response = await request(app.getHttpServer())
      .put(`/api/v1/template/${createdTemplateId}`)
      .send({ content: 'Updated content {{name}}' })
      .expect(200);

    expect(response.body.content).toBe('Updated content {{name}}');
    expect(response.body.currentVersion).toBe(2);
  });

  it('PUT /template/:id — returns 400 when no fields provided', async () => {
    await request(app.getHttpServer())
      .put(`/api/v1/template/${createdTemplateId}`)
      .send({})
      .expect(400);
  });

  it('GET /template/:id/versions — lists versions', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/template/${createdTemplateId}/versions`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('GET /template/:id/versions/:versionNumber — gets specific version', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/template/${createdTemplateId}/versions/2`)
      .expect(200);

    expect(response.body.versionNumber).toBe(2);
    expect(response.body.templateId).toBe(createdTemplateId);
  });

  it('GET /template?name= — filters templates by name text search', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/template')
      .query({ name: 'e2e temp' })
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].id).toBe(createdTemplateId);
  });

  it('GET /template?tags= — filters templates by tags', async () => {
    const matching = await request(app.getHttpServer())
      .get('/api/v1/template')
      .query({ tags: 'e2e' })
      .expect(200);
    expect(matching.body).toHaveLength(1);

    const noMatch = await request(app.getHttpServer())
      .get('/api/v1/template')
      .query({ tags: 'unknown-tag' })
      .expect(200);
    expect(noMatch.body).toHaveLength(0);
  });
});
