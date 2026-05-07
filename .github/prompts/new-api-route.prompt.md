---
mode: agent
description: "Plan and implement a new API route in this repository using API-first + hexagonal architecture conventions."
---

# New API Route

Implement a new endpoint in this NestJS project by following the workspace skill `add-api-route` and the repository instructions.

## Collect Missing Inputs First

If any details are missing, ask concise questions before coding:

- HTTP method
- Route path under `/api/v1`
- Module/feature name
- Request payload, params, and query schema
- Response schema and expected status codes
- Persistence rules and failure scenarios

## Execution Rules

- Apply API-first workflow: define/update `openapi.yaml` contract first
- Respect hexagonal layering: `infrastructure -> application -> domain`
- Keep `domain/` framework-free
- Add/update DTO validation and Swagger decorators
- Add/update unit and e2e tests
- Regenerate and commit `openapi.yaml`
- Run validation commands (`lint`, `test`, `test:e2e`, `build`) when feasible

## Output Format

Report at the end:

1. Route implemented (method + path)
2. Files changed grouped by layer
3. Contract and OpenAPI regeneration status
4. Test/validation results
5. Assumptions and follow-up actions
