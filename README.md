# SDD Michelin - Prompt Versioning API

A REST API for managing and versioning prompts, built with **NestJS**, **TypeORM**, and **PostgreSQL**.

## Project Overview

This is a **Prompt Versioning API** that provides functionality to:
- Create, read, update, and manage prompts
- Version templates with support for multiple versions
- Manage template variables
- Generate and execute prompts

The project follows **Hexagonal (Ports & Adapters) Architecture** with strict separation of concerns across domain, application, and infrastructure layers.

**Tech Stack:**
- Runtime: Node.js 20+
- Framework: NestJS 11+
- Language: TypeScript 5+ (strict mode)
- Database: PostgreSQL 16
- ORM: TypeORM
- API Documentation: Swagger/OpenAPI 3.0
- Testing: Jest + Supertest

---

## Quick Start

### Option 1: Launch with Docker (Recommended)

The easiest way to get the project running with a full PostgreSQL setup.

#### Prerequisites
- Docker
- Docker Compose

#### Launch Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/hsubtil/sdd-michelin.git
   cd sdd-michelin
   ```

2. **Create a `.env` file at the project root:**
   ```bash
   cat > .env << EOF
   NODE_ENV=production
   PORT=3000
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=prompt_versioning
   DB_HOST=db
   DB_PORT=5432
   EOF
   ```

3. **Start the application with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

4. **Verify the application is running:**
   - API: http://localhost:3000/api/v1
   - Swagger Documentation: http://localhost:3000/api/docs

5. **Stop the application:**
   ```bash
   docker-compose down
   ```

6. **Clean up volumes (optional):**
   ```bash
   docker-compose down -v
   ```

---

### Option 2: Launch Locally (Without Docker)

Run the application on your local machine with a PostgreSQL database.

#### Prerequisites
- Node.js 20+ (with npm or yarn)
- PostgreSQL 16+ running locally or accessible

#### Setup Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/hsubtil/sdd-michelin.git
   cd sdd-michelin
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up PostgreSQL:**

   **Option A: PostgreSQL is already running locally**
   
   Create a database and user:
   ```sql
   CREATE USER postgres WITH PASSWORD 'postgres';
   CREATE DATABASE prompt_versioning OWNER postgres;
   ```

   **Option B: Run PostgreSQL in Docker (without full Docker Compose):**
   ```bash
   docker run --name postgres-sdd \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_DB=prompt_versioning \
     -p 5432:5432 \
     -d postgres:16-alpine
   ```

4. **Create a `.env` file at the project root:**
   ```bash
   cat > .env << EOF
   NODE_ENV=development
   PORT=3000
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=prompt_versioning
   DB_HOST=localhost
   DB_PORT=5432
   EOF
   ```

5. **Run database migrations:**
   ```bash
   npm run migration:run
   ```

6. **Start the application:**

   **Development mode (with watch):**
   ```bash
   npm run start:dev
   ```

   **Production mode:**
   ```bash
   npm run build
   npm run start
   ```

7. **Verify the application is running:**
   - API: http://localhost:3000/api/v1
   - Swagger Documentation: http://localhost:3000/api/docs

---

## Environment Configuration

The application requires the following environment variables:

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `NODE_ENV` | string | ✓ | - | Environment: `development`, `test`, or `production` |
| `PORT` | number | ✗ | `3000` | Server port |
| `DB_HOST` | string | ✓ | - | PostgreSQL host |
| `DB_PORT` | number | ✓ | - | PostgreSQL port |
| `DB_USER` | string | ✓ | - | PostgreSQL username |
| `DB_PASSWORD` | string | ✓ | - | PostgreSQL password |
| `DB_NAME` | string | ✓ | - | PostgreSQL database name |

---

## Available Commands

### Development & Building
```bash
# Build the application
npm run build

# Start the application (production)
npm run start

# Start with watch mode (development)
npm run start:dev
```

### Linting & Code Quality
```bash
# Run ESLint
npm run lint
```

### Testing
```bash
# Run unit tests
npm run test

# Run unit tests with coverage
npm run test:cov

# Run end-to-end tests
npm run test:e2e
```

### Database Management
```bash
# Run pending migrations
npm run migration:run

# Generate a new migration
npm run migration:generate -- src/<module>/infrastructure/persistence/migrations/<MigrationName>
```

### API Documentation
```bash
# Generate OpenAPI spec
npm run openapi:generate
```

---

## API Documentation

Once the application is running, visit the **Swagger UI** at:
```
http://localhost:3000/api/docs
```

The API is versioned under the `/api/v1` base path. All endpoints are documented with detailed schemas and examples.

---

## Project Structure

```
src/
├── config/              # Environment configuration
├── database/            # Database data source
├── common/
│   └── filters/         # Global exception filters
├── prompt/              # Prompt module (hexagonal architecture)
│   ├── domain/          # Business logic & entities
│   ├── application/     # Use cases & DTOs
│   └── infrastructure/  # Controllers & repositories
├── template/            # Template module (hexagonal architecture)
│   ├── domain/          # Template entities & value objects
│   ├── application/     # Use cases & DTOs
│   └── infrastructure/  # Controllers & repositories
└── version/             # Version module
test/                    # E2E tests
scripts/                 # Build & generation scripts
```

Each module follows the **Hexagonal (Ports & Adapters) architecture** with strict layer separation.

---

## Troubleshooting

### Docker Issues

**Port already in use:**
```bash
# Change ports in docker-compose.yml or use:
docker-compose up -p my_app
```

**Database connection errors:**
```bash
# Check if PostgreSQL is healthy:
docker-compose ps

# View logs:
docker-compose logs db
```

### Local Development Issues

**PostgreSQL connection refused:**
- Verify PostgreSQL is running: `psql -U postgres -d prompt_versioning`
- Check `.env` file has correct credentials
- Ensure DB_HOST is `localhost` (not `127.0.0.1`)

**Migration errors:**
```bash
# Re-run migrations:
npm run migration:run

# Check migration status:
npm run migration:show
```

**Port already in use:**
```bash
# Change PORT in .env or kill the process:
lsof -i :3000
kill -9 <PID>
```

---

## Development Workflow

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make your changes** following the project architecture guidelines

3. **Test locally:**
   ```bash
   npm run test
   npm run test:e2e
   ```

4. **Run linting:**
   ```bash
   npm run lint
   ```

5. **Generate updated API docs:**
   ```bash
   npm run openapi:generate
   ```

6. **Commit and push:**
   ```bash
   git add .
   git commit -m "feat: description of changes"
   git push origin feature/my-feature
   ```

---

## Architecture Notes

- **Hexagonal Architecture**: Domain logic is isolated in the `domain/` layer, independent of frameworks
- **Dependency Injection**: NestJS handles DI via injection tokens defined in `*.tokens.ts`
- **Database Migrations**: TypeORM migrations manage schema evolution
- **API-First Design**: OpenAPI spec is the source of truth for API contracts
- **Strict TypeScript**: `strict: true` enforces type safety

See [DECISIONS.MD](DECISIONS.MD) and [SPEC.MD](SPEC.MD) for architectural decisions and API specifications.

---

## Contributing

1. Follow the coding standards in `.github/instructions/`
2. Ensure all tests pass
3. Update API documentation when adding/modifying endpoints
4. Use conventional commit messages

---

## License

ISC

---

## Support

For issues or questions, visit the [GitHub Issues](https://github.com/hsubtil/sdd-michelin/issues) page.
