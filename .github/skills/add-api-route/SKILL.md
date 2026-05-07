---
name: add-api-route
description: "Implement a new API route end-to-end in this NestJS project. Use when: adding a new endpoint, creating a new route implementation, wiring hexagonal layers, adding DTO/controller/use-case/repository pieces, and updating OpenAPI + tests."
argument-hint: "Describe the route: method, path, module, request/response shape, and persistence behavior"
---

# Add API Route Implementation

Implement a new API route using this project's API-first and hexagonal architecture rules.

## When to Use

- The user asks to add a new endpoint (GET/POST/PATCH/DELETE)
- A route contract exists but implementation is missing
- A feature requires domain, application, and infrastructure wiring
- A controller/use-case/repository flow must be added or updated

## Required Project Constraints

Follow these constraints for every route implementation:

- API-first: update or define the contract in `openapi.yaml` before code behavior changes
- Keep dependency direction: `infrastructure -> application -> domain`
- Do not import NestJS/TypeORM in `domain/`
- Use ports and adapters, not direct concrete coupling across layers
- Use strict typing, no `any`
- Use RFC 7807 style for error responses
- Regenerate and commit `openapi.yaml` after DTO/controller changes

## Inputs to Collect

Gather or infer:

- HTTP method and full path under `/api/v1`
- Feature/module name
- Request payload/query/path params
- Response payload and status code
- Validation rules and error cases
- Persistence behavior (read/write, unique constraints, not found, etc.)

If details are missing, ask concise clarifying questions first.

## Implementation Workflow

### 1. Contract First

1. Update `openapi.yaml` for the new route:
   - operationId, tags, summary/description
   - request body schema (if needed)
   - response schemas and status codes
   - error responses using Problem Details shape
2. Confirm route is consistent with API conventions.

### 2. Domain Layer

Create or update only domain concerns:

- Entity/value object changes (framework-free)
- Inbound port in `domain/ports/in` (use-case interface)
- Outbound port in `domain/ports/out` (repository interface)

Add JSDoc to public ports/interfaces.

### 3. Application Layer

Implement use-case and mapping:

- Use-case implementation in `application/use-cases`
- Application DTOs and mappers as needed
- Enforce business rules and map domain <-> DTOs

Application layer must not import infrastructure classes.

### 4. Infrastructure Layer

Wire NestJS and persistence adapters:

- Controller in `infrastructure/adapters/in`
- ORM repository adapter in `infrastructure/adapters/out`
- TypeORM persistence entity/migration updates if needed
- Map persistence models to domain entities

Controller requirements:

- `@ApiTags`, `@ApiOperation`, `@ApiResponse` annotations
- `class-validator` DTO validation
- proper status codes (201/200/204 depending on operation)

### 5. Module Wiring

Update module/provider registration:

- Bind use-case ports via injection tokens
- Bind repository ports to ORM adapters
- Ensure module exports/providers are correct

### 6. Tests

Add or update tests:

- Unit tests for use-case logic and edge cases
- E2E route test for happy path and key failure path

### 7. Regenerate and Verify OpenAPI

After controller/DTO changes:

1. Regenerate `openapi.yaml` with the project's swagger generation command
2. Ensure generated spec matches implementation
3. Commit the regenerated spec alongside code

### 8. Validate

Run quality checks:

- `npm run lint`
- `npm run test`
- `npm run test:e2e`
- `npm run build`

Fix issues introduced by the route change.

## Output Checklist

Before finishing, confirm all are true:

- Contract updated first and kept in sync
- Domain/application/infrastructure boundaries respected
- Route implemented and reachable under `/api/v1`
- Tests added/updated and passing
- `openapi.yaml` regenerated and committed
- No `any`, no forbidden layer imports

## Suggested Response Format

When completing work, report:

1. Route added (method + path)
2. Files changed by layer (domain/application/infrastructure/tests/spec)
3. Validation/test command results
4. Any assumptions or follow-up actions
