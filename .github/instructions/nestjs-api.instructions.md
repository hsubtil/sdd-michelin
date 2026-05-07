---
applyTo: "src/**/*.controller.ts,src/**/*.module.ts,src/**/*.dto.ts,src/**/*.decorator.ts"
---

# NestJS API Layer Rules

## Base Path

All routes are prefixed with `/api/v1`. Set this globally in `main.ts`:

```typescript
app.setGlobalPrefix('api/v1');
```

## Controllers (`infrastructure/adapters/in/`)

- One controller per aggregate root
- Controllers **only** handle HTTP concerns: parsing request, calling use-case, returning response
- No business logic in controllers
- Inject use-cases via `@Inject(TOKEN)` using the interface type, never the concrete class

```typescript
@ApiTags('prompts')
@Controller('prompts')
export class PromptController {
  constructor(
    @Inject(CREATE_PROMPT_USE_CASE)
    private readonly createPromptUseCase: ICreatePromptUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new prompt' })
  @ApiResponse({ status: 201, type: PromptResponseDto })
  @ApiResponse({ status: 422, description: 'Validation error' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreatePromptDto): Promise<PromptResponseDto> {
    return this.createPromptUseCase.execute(dto);
  }
}
```

## OpenAPI Documentation (mandatory on every endpoint)

Every route method **must** have:
- `@ApiTags('resource-name')` on the controller class
- `@ApiOperation({ summary: '...' })` on every method
- `@ApiResponse({ status: XXX, ... })` for every possible HTTP status code returned

HTTP status conventions:
- `201 Created` — POST (resource creation)
- `200 OK` — GET, PATCH, PUT
- `204 No Content` — DELETE
- `404 Not Found` — when a resource is not found
- `422 Unprocessable Entity` — validation errors
- `500 Internal Server Error` — unexpected errors

## DTOs

### Request DTOs (`application/dto/`)

- Use `class-validator` decorators for all fields
- Use `class-transformer` for type coercion
- Decorate every field with `@ApiProperty` for OpenAPI schema generation
- Never expose internal IDs or sensitive fields in request DTOs

```typescript
export class CreatePromptDto {
  @ApiProperty({ description: 'The prompt content', example: 'You are a helpful assistant.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10_000)
  readonly content: string;

  @ApiProperty({ description: 'Semantic label for this prompt', example: 'customer-support-v1' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  readonly label: string;
}
```

### Response DTOs

- Use `@ApiProperty` on every field
- Explicitly list every field — do not use `@ApiProperty({ type: 'object' })` as a catch-all
- Return a response DTO from controllers, never a domain entity or ORM entity

## Validation Pipe

Register `ValidationPipe` globally in `main.ts`:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);
```

## Error Handling

- Use a global `ExceptionFilter` to normalize errors to RFC 7807 Problem Details format:

```json
{
  "type": "https://api.example.com/errors/not-found",
  "title": "Resource not found",
  "status": 404,
  "detail": "Prompt with id '123' was not found"
}
```

- Throw `NotFoundException`, `UnprocessableEntityException`, etc. from use-cases (NestJS HTTP exceptions are acceptable in use-cases since they carry HTTP semantics)
- Never expose stack traces in production responses

## Swagger Setup

Configure Swagger in `main.ts`:

```typescript
const config = new DocumentBuilder()
  .setTitle('Prompt Versioning API')
  .setDescription('REST API for managing and versioning prompts')
  .setVersion('1.0')
  .build();
const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

## Module Structure

Each `{Entity}Module` must:
1. Import `TypeOrmModule.forFeature([EntityOrm])` for its ORM entities
2. Register all use-case and repository providers with their injection tokens
3. Register the controller

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([PromptOrm, PromptVersionOrm])],
  controllers: [PromptController],
  providers: [
    { provide: PROMPT_REPOSITORY, useClass: PromptOrmRepository },
    { provide: CREATE_PROMPT_USE_CASE, useClass: CreatePromptUseCase },
  ],
})
export class PromptModule {}
```
