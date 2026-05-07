---
applyTo: "src/**/infrastructure/**"
---

# Persistence & Infrastructure Layer Rules

## Database

- **PostgreSQL** is the target database
- All schema changes must be captured in a TypeORM migration — never use `synchronize: true` in production
- The `synchronize` option must be `false` in all non-test environments

## TypeORM Configuration

Configure TypeORM via `TypeOrmModule.forRootAsync` in `AppModule`, reading all settings from `ConfigService`:

```typescript
TypeOrmModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    type: 'postgres',
    host: config.get<string>('DB_HOST'),
    port: config.get<number>('DB_PORT'),
    username: config.get<string>('DB_USER'),
    password: config.get<string>('DB_PASSWORD'),
    database: config.get<string>('DB_NAME'),
    entities: [__dirname + '/**/*.orm.entity{.ts,.js}'],
    migrations: [__dirname + '/**/*migration{.ts,.js}'],
    synchronize: false,
    logging: config.get<string>('NODE_ENV') === 'development',
  }),
})
```

## ORM Entities (`persistence/entities/`)

- Naming: `{Entity}Orm` (e.g., `PromptOrm`, `PromptVersionOrm`)
- File naming: `{entity}.orm.entity.ts`
- ORM entities are **separate classes** from domain entities — they exist only in `infrastructure/`
- Decorate with TypeORM annotations: `@Entity()`, `@Column()`, `@PrimaryColumn()`, etc.
- Always define explicit table names: `@Entity('prompts')`
- Use `@CreateDateColumn()` and `@UpdateDateColumn()` for timestamps

```typescript
// infrastructure/persistence/entities/prompt.orm.entity.ts
@Entity('prompts')
export class PromptOrm {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'varchar', length: 255 })
  label: string;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => PromptVersionOrm, (version) => version.prompt, { cascade: true })
  versions: PromptVersionOrm[];
}
```

## Repository Implementations (`adapters/out/`)

- Naming: `{Entity}OrmRepository`
- Each repository implements exactly one driven port from `domain/ports/out/`
- Decorate with `@Injectable()`
- Inject `DataSource` or the TypeORM repository via `@InjectRepository(EntityOrm)`
- **Always use mappers** to convert between ORM entities and domain entities — never return an ORM entity outside of `infrastructure/`

```typescript
// infrastructure/adapters/out/prompt.orm.repository.ts
@Injectable()
export class PromptOrmRepository implements IPromptRepository {
  constructor(
    @InjectRepository(PromptOrm)
    private readonly repo: Repository<PromptOrm>,
  ) {}

  async save(prompt: Prompt): Promise<Prompt> {
    const orm = PromptMapper.toOrm(prompt);
    const saved = await this.repo.save(orm);
    return PromptMapper.toDomain(saved);
  }

  async findById(id: string): Promise<Prompt | null> {
    const orm = await this.repo.findOne({ where: { id }, relations: ['versions'] });
    return orm ? PromptMapper.toDomain(orm) : null;
  }
}
```

## Mappers (`application/mappers/`)

- One mapper per aggregate (e.g., `PromptMapper`)
- Static methods only: `toDomain(orm: PromptOrm): Prompt` and `toOrm(domain: Prompt): PromptOrm`
- `toDomain` uses `Entity.reconstitute(...)` to rehydrate the domain object
- Mappers live in `application/mappers/` (not in `infrastructure/`) as they bridge both layers

```typescript
// application/mappers/prompt.mapper.ts
export class PromptMapper {
  static toDomain(orm: PromptOrm): Prompt {
    return Prompt.reconstitute({
      id: orm.id,
      label: orm.label,
      content: orm.content,
      createdAt: orm.createdAt,
      versions: orm.versions?.map(PromptVersionMapper.toDomain) ?? [],
    });
  }

  static toOrm(domain: Prompt): PromptOrm {
    const orm = new PromptOrm();
    orm.id = domain.id;
    orm.label = domain.label;
    orm.content = domain.content;
    orm.createdAt = domain.createdAt;
    return orm;
  }
}
```

## Migrations

- Generate a migration after every schema change:
  ```bash
  npm run migration:generate -- src/<module>/infrastructure/persistence/migrations/<MigrationName>
  ```
- Run migrations before starting the application:
  ```bash
  npm run migration:run
  ```
- Never edit a migration file that has already been run in any environment
- Migration class names must be descriptive: `CreatePromptTable1700000000000`, not `Migration1700000000000`

## Transactions

- Transactions are managed at the use-case level, not inside repositories
- Use `DataSource.transaction(...)` or `EntityManager` when a use-case needs to coordinate multiple repository calls within a single transaction
- Pass the `EntityManager` down to repositories when transactional context is required
