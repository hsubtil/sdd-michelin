---
applyTo: "src/**/domain/**"
---

# Domain Layer Rules

## Core Principle

The domain layer is the heart of the application. It must be **completely isolated** from all frameworks, ORMs, and infrastructure concerns. A file inside `domain/` must be compilable with zero NestJS, TypeORM, class-validator, or any third-party dependency.

## Entities (`domain/entities/`)

- Model real business concepts, not database tables
- Expose named factory methods (`static create(...)`) instead of public constructors when creation requires validation
- Business invariants are enforced inside the entity, not in use-cases or controllers
- Properties are `readonly` by default; expose mutation only through explicit business methods
- No `@Entity()`, `@Column()`, `@IsString()` or any framework decorator

```typescript
// domain/entities/prompt.entity.ts
export class Prompt {
  readonly id: string;
  readonly label: string;
  readonly content: string;
  readonly createdAt: Date;
  private _versions: PromptVersion[];

  private constructor(props: PromptProps) {
    this.id = props.id;
    this.label = props.label;
    this.content = props.content;
    this.createdAt = props.createdAt;
    this._versions = props.versions ?? [];
  }

  static create(props: Omit<PromptProps, 'id' | 'createdAt'>): Prompt {
    return new Prompt({
      ...props,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    });
  }

  static reconstitute(props: PromptProps): Prompt {
    return new Prompt(props);
  }

  addVersion(content: string): PromptVersion {
    const version = PromptVersion.create({
      promptId: this.id,
      content,
      versionNumber: this._versions.length + 1,
    });
    this._versions.push(version);
    return version;
  }

  get versions(): ReadonlyArray<PromptVersion> {
    return [...this._versions];
  }
}
```

Use `static create(...)` for new instances (generates ID, sets timestamps).  
Use `static reconstitute(...)` to rehydrate from persistence (preserves existing ID and timestamps).

## Value Objects (`domain/value-objects/`)

- Represent concepts identified by their **value**, not by identity
- Always **immutable**: every property is `readonly`
- Implement an `equals(other: T): boolean` method
- Never have a database ID
- Validate their invariants in the constructor

```typescript
// domain/value-objects/version-number.value-object.ts
export class VersionNumber {
  readonly value: number;

  constructor(value: number) {
    if (!Number.isInteger(value) || value < 1) {
      throw new Error(`VersionNumber must be a positive integer, got: ${value}`);
    }
    this.value = value;
  }

  equals(other: VersionNumber): boolean {
    return this.value === other.value;
  }

  next(): VersionNumber {
    return new VersionNumber(this.value + 1);
  }
}
```

## Driving Ports (`domain/ports/in/`)

Use-case interfaces that define **what the application can do**. One interface per use-case.

- Naming: `I{Action}{Entity}UseCase`
- A single `execute(...)` method
- Must have JSDoc on the interface and the method

```typescript
// domain/ports/in/i-create-prompt.use-case.ts

/** Use-case for creating a new prompt with its initial version. */
export interface ICreatePromptUseCase {
  /**
   * Creates a new prompt.
   * @param dto - The data required to create the prompt.
   * @returns The created prompt as a DTO.
   */
  execute(dto: CreatePromptDto): Promise<PromptDto>;
}
```

## Driven Ports (`domain/ports/out/`)

Repository interfaces that define **what the application needs from persistence**. The domain defines the contract; infrastructure implements it.

- Naming: `I{Entity}Repository`
- Methods use domain entities as parameters and return types (never ORM entities)
- Must have JSDoc on the interface and each method

```typescript
// domain/ports/out/i-prompt.repository.ts

/** Persistence contract for the Prompt aggregate. */
export interface IPromptRepository {
  /** Persists a new or updated prompt. */
  save(prompt: Prompt): Promise<Prompt>;

  /** Finds a prompt by its unique identifier. Returns null if not found. */
  findById(id: string): Promise<Prompt | null>;

  /** Returns all prompts ordered by creation date descending. */
  findAll(): Promise<Prompt[]>;

  /** Removes a prompt permanently. */
  delete(id: string): Promise<void>;
}
```

## What is FORBIDDEN in the domain layer

- `import { Injectable } from '@nestjs/common'` — no NestJS
- `import { Column, Entity } from 'typeorm'` — no TypeORM
- `import { IsString } from 'class-validator'` — no class-validator
- Any `async` call to a database, HTTP service, or file system
- `console.log` or any logger — use domain events or let the caller handle it
