---
applyTo: "src/**"
---

# Hexagonal Architecture Rules

## Mandatory Module Structure

Every feature module **must** respect the following folder structure. Do not deviate from it.

```
src/
  <module>/
    domain/
      entities/
      value-objects/
      ports/
        in/
        out/
    application/
      use-cases/
      dto/
      mappers/
    infrastructure/
      adapters/
        in/
        out/
      persistence/
        entities/
        migrations/
```

## Dependency Rule

The direction of dependencies is strictly:

```
infrastructure  →  application  →  domain
```

- `domain/` **must never** import anything from `application/` or `infrastructure/`
- `application/` **must never** import anything from `infrastructure/`
- Violations of this rule must be fixed immediately

## Domain Layer (`domain/`)

- Contains pure TypeScript classes and interfaces only
- **Zero framework imports**: no NestJS decorators, no TypeORM decorators, no class-validator
- Entities model business concepts and expose business methods
- Value Objects are immutable; use `readonly` for all properties
- Ports (`interfaces`) define the contracts between layers

## Application Layer (`application/`)

- Use-cases implement exactly one domain driving port (`ports/in/`)
- A use-case does one thing: it orchestrates domain objects and calls driven ports
- Never put business logic in a use-case; delegate it to domain entities
- DTOs in `application/dto/` represent input/output for use-cases
- Mappers in `application/mappers/` translate between domain entities and DTOs

## Infrastructure Layer (`infrastructure/`)

- Primary adapters (`adapters/in/`): NestJS controllers only
- Secondary adapters (`adapters/out/`): TypeORM repository implementations
- ORM entities live in `persistence/entities/` and are decorated with TypeORM annotations
- Domain entities and ORM entities are **always separate classes**

## Ports

### Driving Ports (`domain/ports/in/`)
Interfaces that define what the application can do:

```typescript
// domain/ports/in/i-create-prompt.use-case.ts
export interface ICreatePromptUseCase {
  execute(dto: CreatePromptDto): Promise<PromptDto>;
}
```

### Driven Ports (`domain/ports/out/`)
Interfaces that define what the application needs from the outside:

```typescript
// domain/ports/out/i-prompt.repository.ts
export interface IPromptRepository {
  save(prompt: Prompt): Promise<Prompt>;
  findById(id: string): Promise<Prompt | null>;
  findAll(): Promise<Prompt[]>;
}
```

## Injection Tokens

Use string-based or Symbol injection tokens in NestJS modules to avoid coupling to concrete classes:

```typescript
// <module>/<module>.tokens.ts
export const PROMPT_REPOSITORY = Symbol('IPromptRepository');
export const CREATE_PROMPT_USE_CASE = Symbol('ICreatePromptUseCase');
```

Inject via `@Inject(token)` in controllers and use-cases, never via the concrete class type.

## Module Registration

Each module's `{Entity}Module` is responsible for:
1. Declaring all providers with their injection tokens
2. Registering TypeORM entities via `TypeOrmModule.forFeature([...])`
3. Exporting use-case tokens if consumed by other modules
