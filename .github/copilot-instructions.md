# Copilot Instructions — Prompt Versioning API

## Project Overview

This repository implements a **REST API for managing and versioning prompts**, built with Node.js and NestJS.  
There is no authentication, rate limiting, or multi-tenancy at this stage.

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: NestJS (latest stable)
- **Language**: TypeScript 5+ with `strict: true`
- **ORM**: TypeORM
- **Database**: PostgreSQL
- **API Documentation**: Swagger / OpenAPI 3.0 (`@nestjs/swagger`)
- **Validation**: `class-validator` + `class-transformer`
- **Testing**: Jest (unit), Supertest (e2e)

## Architecture: Hexagonal (Ports & Adapters)

Every feature module **must** follow a strict three-layer structure:

```
src/
  <module>/
    domain/
      entities/          # Pure business classes — zero framework imports
      value-objects/     # Immutable, equality by value
      ports/
        in/              # Use-case interfaces (driving ports)
        out/             # Repository interfaces (driven ports)
    application/
      use-cases/         # Implement domain ports/in
      dto/               # Application-level DTOs
      mappers/           # Map domain entities <-> DTOs
    infrastructure/
      adapters/
        in/              # NestJS controllers (primary adapters)
        out/             # TypeORM repositories (secondary adapters)
      persistence/
        entities/        # @Entity() TypeORM classes
        migrations/      # TypeORM migrations
test/                    # E2E tests (supertest)
```

### Dependency Rule (strictly enforced)

```
infrastructure → application → domain
```

- `domain/` must **never** import from `application/` or `infrastructure/`
- `application/` must **never** import from `infrastructure/`
- Controllers inject use-cases via NestJS injection tokens (not concrete classes)
- Repositories inject their TypeORM entities; domain never knows TypeORM

## Naming Conventions

| Artifact | Pattern | Example |
|---|---|---|
| Use-case interface | `I{Action}{Entity}UseCase` | `ICreatePromptUseCase` |
| Repository interface | `I{Entity}Repository` | `IPromptRepository` |
| Use-case implementation | `{Action}{Entity}UseCase` | `CreatePromptUseCase` |
| ORM repository | `{Entity}OrmRepository` | `PromptOrmRepository` |
| Controller | `{Entity}Controller` | `PromptController` |
| DTO | `{Action}{Entity}Dto` | `CreatePromptDto` |
| TypeORM entity | `{Entity}Orm` | `PromptOrm` |
| NestJS module | `{Entity}Module` | `PromptModule` |

## API Conventions

- Base path: `/api/v1`
- All routes documented with `@ApiTags`, `@ApiOperation`, `@ApiResponse`
- HTTP 201 for creation, 200 for reads/updates, 204 for deletes
- Error responses follow RFC 7807 (Problem Details) shape

## Key Commands

```bash
# Install dependencies
npm install

# Build
npm run build

# Start (development, with watch)
npm run start:dev

# Lint
npm run lint

# Unit tests
npm run test

# Unit tests with coverage
npm run test:cov

# E2E tests
npm run test:e2e

# Run database migrations
npm run migration:run

# Generate a new migration
npm run migration:generate -- src/<module>/infrastructure/persistence/migrations/<MigrationName>
```

## General Rules

- Every public interface and port must have JSDoc documentation.
- Never use `any` — use `unknown` and narrow the type.
- Prefer `readonly` properties on domain entities and value objects.
- All environment variables must be accessed via a validated `ConfigService` (NestJS), never via `process.env` directly.
- Do not add authentication, rate limiting, or multi-tenancy features unless explicitly requested.
