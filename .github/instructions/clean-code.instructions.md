---
applyTo: "**/*.ts"
---

# Clean Code Rules

## TypeScript Strictness

- `strict: true` is mandatory in `tsconfig.json` — never disable it
- **Never use `any`** — use `unknown` and narrow the type with type guards
- Avoid type assertions (`as T`) unless interfacing with untyped third-party code; document why when used
- Use explicit return types on all public methods and functions
- Prefer `readonly` on all properties that should not be reassigned after construction
- Prefer `const` over `let`; avoid `var`

```typescript
// ❌ Bad
function process(data: any): any { ... }

// ✅ Good
function process(data: unknown): ProcessedResult {
  if (typeof data !== 'string') throw new Error('Expected string');
  ...
}
```

## Naming

| Artifact | Convention | Example |
|---|---|---|
| Class | PascalCase | `CreatePromptUseCase` |
| Interface | PascalCase prefixed with `I` | `IPromptRepository` |
| Method / function | camelCase, verb-first | `createPrompt`, `findById` |
| Variable / property | camelCase, noun | `promptId`, `versionNumber` |
| Constant (module-level) | UPPER_SNAKE_CASE | `MAX_CONTENT_LENGTH` |
| Enum | PascalCase (name) + UPPER_SNAKE_CASE (values) | `PromptStatus.ACTIVE` |
| File | kebab-case | `create-prompt.use-case.ts` |
| Boolean variable | prefix with `is`, `has`, `can` | `isActive`, `hasVersions` |

- Names must be **self-documenting** — avoid abbreviations (`usr` → `user`, `cnt` → `count`)
- No single-letter variables except loop counters (`i`, `j`) and well-known math variables
- Avoid noise words: `Manager`, `Processor`, `Handler`, `Helper` are red flags — rename to express actual responsibility

## Function Design

- **One level of abstraction per function** — a function either coordinates steps (high-level) or implements a step (low-level), never both
- **Maximum 20 lines** per function body — extract when exceeded
- **Maximum 3 parameters** — use an options object when more are needed
- No boolean flags as parameters — split into two named functions instead
- Functions must do **exactly one thing** (SRP at function level)

```typescript
// ❌ Bad — does too many things, boolean flag
async function handlePrompt(dto: CreatePromptDto, shouldNotify: boolean) { ... }

// ✅ Good — separated concerns
async function createPrompt(dto: CreatePromptDto): Promise<Prompt> { ... }
async function notifyPromptCreated(prompt: Prompt): Promise<void> { ... }
```

## Class Design (SOLID)

### Single Responsibility Principle
- One class = one reason to change
- A use-case class handles exactly one use-case
- A repository class handles persistence for one aggregate

### Open/Closed Principle
- Extend behavior via new implementations of interfaces, not by modifying existing classes
- Use ports/adapters to swap implementations without touching the domain

### Liskov Substitution Principle
- Every implementation of an interface must honor the full contract
- Never throw `NotImplemented` in an interface implementation

### Interface Segregation Principle
- Keep interfaces small and focused
- If a repository interface has 10 methods, consider splitting it into read/write interfaces

### Dependency Inversion Principle
- High-level modules (use-cases) must not depend on low-level modules (ORM repositories)
- Both must depend on abstractions (port interfaces)
- Inject dependencies via constructor, never instantiate dependencies with `new` inside a class

## Classes

- **Maximum 200 lines** per class body — extract when exceeded
- No more than **5 dependencies** injected in a constructor — a higher number signals the class does too much
- No `static` mutable state
- Prefer composition over inheritance

## Comments

- **No inline comments** for code that is self-explanatory
- Add **JSDoc** only on public interfaces, ports, and complex public methods
- Never leave `TODO` or `FIXME` comments in committed code — create a ticket instead
- Do not comment out dead code — delete it; version control tracks history

```typescript
// ❌ Bad — noise comment
// Get the prompt by ID
const prompt = await this.promptRepository.findById(id);

// ✅ Good — JSDoc on the interface method, no comment needed on usage
```

## Error Handling

- **Never swallow exceptions** with empty `catch` blocks
- Always propagate or transform exceptions with meaningful context
- Use typed domain exceptions for business rule violations
- Use NestJS HTTP exceptions (`NotFoundException`, `UnprocessableEntityException`) in use-cases for HTTP semantics

```typescript
// ❌ Bad
try {
  return await this.repo.findById(id);
} catch (e) {}

// ✅ Good
const prompt = await this.repo.findById(id);
if (!prompt) {
  throw new NotFoundException(`Prompt with id '${id}' not found`);
}
return prompt;
```

## Imports

- Group imports: (1) Node built-ins → (2) third-party → (3) local, separated by blank lines
- No circular imports — restructure with a shared interface if needed
- Use path aliases (`@/domain/...`) for cross-module imports to avoid long relative paths

## Environment Variables

- **Never access `process.env` directly** — always use NestJS `ConfigService`
- All environment variables must be declared and validated in a `config/` module using `@nestjs/config` with a Joi or `class-validator` schema
