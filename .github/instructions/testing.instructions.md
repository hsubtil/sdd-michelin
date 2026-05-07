---
applyTo: "**/*.spec.ts,**/*.e2e-spec.ts,test/**"
---

# Testing Rules

## Scope

Two types of tests are required:
1. **Unit tests** — one `.spec.ts` file per class (use-cases, domain entities, value objects, mappers)
2. **E2E functional tests** — one file per feature in `test/`, testing the full HTTP stack

## Unit Tests

### File Location & Naming

- Place unit test files next to the class being tested: `my-use-case.spec.ts` alongside `my-use-case.ts`
- Exception: domain entities are tested in `domain/entities/*.spec.ts`

### Structure — AAA Pattern (mandatory)

Every `it()` block must follow **Arrange / Act / Assert** with explicit comments:

```typescript
it('should create a prompt with a generated id', async () => {
  // Arrange
  const dto: CreatePromptDto = { label: 'test', content: 'Hello' };
  mockPromptRepository.save.mockResolvedValueOnce(expectedPrompt);

  // Act
  const result = await useCase.execute(dto);

  // Assert
  expect(result.id).toBeDefined();
  expect(mockPromptRepository.save).toHaveBeenCalledOnce();
});
```

### Test Naming Convention

```
should <expected behavior> when <context or condition>
```

Examples:
- `should return the prompt when it exists`
- `should throw NotFoundException when prompt is not found`
- `should increment version number when adding a new version`

### Mocking Ports (not implementations)

Always mock the **interface (port)**, never the concrete class:

```typescript
const mockPromptRepository: jest.Mocked<IPromptRepository> = {
  save: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  delete: jest.fn(),
};
```

Provide the mock via NestJS `Test.createTestingModule` with the injection token:

```typescript
const module = await Test.createTestingModule({
  providers: [
    CreatePromptUseCase,
    { provide: PROMPT_REPOSITORY, useValue: mockPromptRepository },
  ],
}).compile();
```

### Domain Entity Tests

Test all business methods and invariants directly on the domain class — no NestJS context needed:

```typescript
describe('Prompt', () => {
  describe('addVersion', () => {
    it('should increment the version number when adding a new version', () => {
      // Arrange
      const prompt = Prompt.create({ label: 'test', content: 'v1' });

      // Act
      prompt.addVersion('v2 content');

      // Assert
      expect(prompt.versions).toHaveLength(1);
      expect(prompt.versions[0].versionNumber).toBe(1);
    });
  });
});
```

### Value Object Tests

Test the constructor validation, `equals()`, and derived methods:

```typescript
describe('VersionNumber', () => {
  it('should throw when value is zero', () => {
    expect(() => new VersionNumber(0)).toThrow();
  });

  it('should be equal to another VersionNumber with the same value', () => {
    expect(new VersionNumber(1).equals(new VersionNumber(1))).toBe(true);
  });
});
```

## E2E Functional Tests (`test/`)

### Setup

Use a real NestJS application with a **real PostgreSQL database** (test database). Use `@nestjs/testing` with `Test.createTestingModule` + `app.init()`.

```typescript
// test/prompt.e2e-spec.ts
describe('PromptController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });
```

### Database Isolation

- Use a dedicated test database (configure via `NODE_ENV=test` environment variables)
- Truncate tables before each test or use database transactions that are rolled back after each test
- Never run E2E tests against the development or production database

### Given / When / Then Pattern (mandatory for E2E tests)

All E2E test descriptions and bodies **must** follow the **Given / When / Then** structure:

- **`describe` (outer)** — the resource or feature under test (e.g., `PromptController (e2e)`)
- **`describe` (inner)** — the HTTP action and route (e.g., `POST /api/v1/prompts`)
- **`it` description** — written as `given <context>, when <action>, then <expected outcome>`
- **Body** — structured with `// Given`, `// When`, `// Then` comments

```typescript
describe('PromptController (e2e)', () => {
  describe('POST /api/v1/prompts', () => {
    it('given valid payload, when creating a prompt, then returns 201 with the created resource', async () => {
      // Given
      const payload = { label: 'my-prompt', content: 'You are helpful.' };

      // When
      const response = await request(app.getHttpServer())
        .post('/api/v1/prompts')
        .send(payload);

      // Then
      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.label).toBe('my-prompt');
    });

    it('given missing content, when creating a prompt, then returns 422', async () => {
      // Given
      const payload = { label: 'only-label' };

      // When
      const response = await request(app.getHttpServer())
        .post('/api/v1/prompts')
        .send(payload);

      // Then
      expect(response.status).toBe(422);
    });

    it('given unknown fields in payload, when creating a prompt, then returns 422', async () => {
      // Given
      const payload = { label: 'x', content: 'y', unknownField: 'z' };

      // When
      const response = await request(app.getHttpServer())
        .post('/api/v1/prompts')
        .send(payload);

      // Then
      expect(response.status).toBe(422);
    });
  });
});
```

### Test Scenarios (E2E)

Each E2E test file must cover the **happy path** and the most important **error paths** for an endpoint.

## Coverage

- Use-cases: **100% line coverage** required
- Domain entities and value objects: **100% line coverage** required
- Controllers: covered by E2E tests, not unit tests
- Run coverage: `npm run test:cov`

## What NOT to Test

- NestJS wiring (module imports, decorators)
- TypeORM entity definitions (columns, relations)
- Mapper boilerplate that contains no logic — only test mappers with complex transformations
