# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex) when working with code in this repository. It is the single source of project instructions: `CLAUDE.md` only imports it.

## Overview

Snaptix Backend is a NestJS monorepo with three applications (`gateway`, `user-accounts`, `files`) and three shared libraries (`common`, `contracts`, `core`). Package manager: **pnpm**.

## Commands

All commands run from the repository root.

### Development

```bash
# Start user-accounts in dev mode (auto-runs Docker, prisma generate, prisma deploy)
pnpm user-accounts:start:dev

# Start files in dev mode (auto-runs Docker, prisma generate, prisma deploy)
pnpm files:start:dev

# Start gateway in dev mode
pnpm gateway:start:dev
```

### Build

```bash
pnpm build                    # Build all apps
pnpm user-accounts:build      # Build user-accounts only
pnpm gateway:build            # Build gateway only
```

### Testing

```bash
pnpm test                     # Run all unit tests
pnpm test:watch               # Watch mode
pnpm test:cov                 # With coverage report
pnpm test:e2e                 # E2E tests (gateway)
# Run a single test file:
pnpm test -- --testPathPattern=user.repository
```

### Lint & Format

```bash
pnpm lint                     # ESLint with autofix (files: everything not ignored in eslint.config.mjs)
pnpm lint:check               # ESLint without fixing (used by verify)
pnpm format                   # Prettier: **/*.{ts,js,json,md}
pnpm format:check             # Prettier check without writing (used by verify)
pnpm typecheck                # tsc --noEmit
```

On commit, lint-staged runs (sequentially) `prettier --write` + `eslint --fix` on staged `*.{ts,js}`, `prettier --write` on `*.{json,md}`, and `pnpm skills:check --staged` when skills are staged — the same tools and file types that `verify` checks. Type checks, build, tests and CRAP run only in `verify` (too slow for every commit).

### Verify (required before a task is done)

```bash
pnpm verify   # skills check → format check → prisma generate → typecheck → lint (no fix, complexity limits) → build all apps → unit tests with coverage thresholds → CRAP check
pnpm crap     # report: riskiest functions in the codebase (needs `pnpm test:cov` first)
```

CRAP check (`pnpm crap:check`): every function changed since `origin/dev` must have CRAP ≤ 30 (CRAP = complexity² × (1 − coverage)³ + complexity). If it fails, add unit tests for the listed function or reduce its complexity — do not raise the threshold.

Run `pnpm verify` and get exit code 0 before reporting a task as done and before opening a PR. Run the full script — not a subset of tests or a single service. If it fails, fix and re-run; do not open a PR on a red `verify`. CI (`.github/workflows/ci.yml`) runs the same `pnpm verify` on every PR to `dev` and `main`.

Skills are edited only in `.agents/skills/` (read by Codex). `.claude/skills/` (read by Claude Code) is a copy: after changing a skill run `pnpm skills:sync`. `verify` fails if the two folders differ.

### Docker (shared PostgreSQL)

Single PostgreSQL container on port `10000` hosts all service databases (`user-accounts`, `files`). Databases are created automatically on first start via `scripts/init-db.sh`.

```bash
pnpm docker:up    # Start all containers (postgres, rabbitmq, maildev), waits for health
pnpm docker:stop  # Stop containers (data preserved)
pnpm docker:down  # Stop and remove containers + volumes
```

### Prisma (user-accounts)

```bash
pnpm user-accounts:prisma:generate      # Regenerate Prisma Client from schema
pnpm user-accounts:prisma:migrate:dev   # Create + apply new migration (dev)
pnpm user-accounts:prisma:deploy:dev    # Apply existing migrations (dev)
pnpm user-accounts:prisma:studio:dev    # Open Prisma Studio (dev)
```

### Prisma (files)

```bash
pnpm files:prisma:generate      # Regenerate Prisma Client from schema
pnpm files:prisma:migrate:dev   # Create + apply new migration (dev)
pnpm files:prisma:deploy:dev    # Apply existing migrations (dev)
pnpm files:prisma:studio:dev    # Open Prisma Studio (dev)
```

> Scripts with `:dev` suffix auto-load the service's `.env.development` via `scripts/prisma/prisma-wrapper.ts`.

## Architecture

### Monorepo Structure

```
apps/
  gateway/          ← API Gateway (entry point for external requests, mostly placeholder)
  user-accounts/    ← User management microservice (DB: user-accounts)
  files/            ← File storage microservice (DB: files)
libs/
  common/           ← Framework-agnostic: interfaces, types, enums, utils (no NestJS, no ORM)
  contracts/        ← Inter-service DTOs and events (used by sender and receiver)
  core/             ← NestJS infrastructure modules (add here when 2+ services need same setup)
```

### Library Placement Rules

When adding a new shared file, ask in order:

1. Used in only one service? → `apps/service-name/src/` (not `libs/`)
2. Inter-service communication structure (DTO, Event)? → `libs/contracts/`
3. NestJS module (`@Module`, `@Injectable`)? → `libs/core/`
4. Pure utility/type/interface/abstract class? → `libs/common/`

**Never put in `libs/`:** Prisma schema/migrations, `PrismaModule`/`PrismaService`, service-specific business logic.

Path aliases: `@snaptix/common`, `@snaptix/contracts`, `@snaptix/core`

### Layered Architecture (per module)

Each feature module inside a service follows a strict 4-layer structure:

```
modules/users/
  api/              ← Controllers (HTTP handlers, delegates to CommandBus/QueryBus)
  application/      ← CQRS use cases (CommandHandlers, QueryHandlers)
  domain/           ← Entities, domain DTOs, business rules (no framework deps)
  infrastructure/   ← Repositories, query-repositories (Prisma integration)
  converter/        ← Bidirectional mapping between domain entities and Prisma models
```

### CQRS Pattern

The project uses `@nestjs/cqrs`. Controllers dispatch commands via `CommandBus.execute()`. Use cases are `@CommandHandler` / `@QueryHandler` classes. Example flow:

```
Controller → CommandBus.execute(new CreateUserCommand(...)) → CreateUserUseCase.execute()
```

### Domain Entities

Entities expose two static factory methods:

- `Entity.create(dto)` — creates a new instance (e.g., for registration)
- `Entity.restore(model)` — reconstructs from a persisted Prisma model

### Type Dependencies in Use Cases

Use cases (application layer) must reference domain **interfaces** (`IUser`, `IOrder`, etc.) rather than concrete entity classes (`UserEntity`) when declaring return types or intermediate types. Concrete classes are used only for calling factory methods.

```ts
// Correct — depends on the interface contract
type CommandResponse = Pick<IUser, 'id'>;

// Wrong — depends on the concrete class
type CommandResponse = Pick<UserEntity, 'id'>;
```

This follows DIP: the application layer depends on stable abstractions (`libs/common` interfaces), not on domain class implementations.

### Converter Pattern

`UniversalConverter<Entity, PrismaModel>` (from `libs/common`) is extended per-module. Accepts two factory functions in constructor: one for entity→model, one for model→entity. Repositories use converters to bridge the domain/persistence boundary.

### Environment Configuration

Each service uses environment-specific `.env` files:

- `.env.development` — local dev (auto-loaded)
- `.env.development.local` — local overrides (git-ignored)
- `.env.production`, `.env.test`

Loading priority: `.env.{NODE_ENV}.local` > `.env.{NODE_ENV}` > `.env.production`

### Prisma Setup

Each service with a DB has its own isolated Prisma setup:

| Service         | Schema                                    | Generated client                           | Env var                      |
| --------------- | ----------------------------------------- | ------------------------------------------ | ---------------------------- |
| `user-accounts` | `apps/user-accounts/prisma/schema.prisma` | `apps/user-accounts/src/generated/prisma/` | `POSTGRES_USER_ACCOUNTS_URL` |
| `files`         | `apps/files/prisma/schema.prisma`         | `apps/files/src/generated/prisma/`         | `POSTGRES_FILES_URL`         |

- `PrismaService` uses `@prisma/adapter-pg` with a `pg` Pool
- `PrismaModule` is local to each service (never shared via `libs/`)
- Both services connect to the same PostgreSQL container on port `10000`, different databases

### Swagger

The Nest CLI plugin (`@nestjs/swagger`) is enabled in `nest-cli.json` with `introspectComments: true`. DTOs are auto-documented from TypeScript types and JSDoc comments — no need to add `@ApiProperty()` manually.
