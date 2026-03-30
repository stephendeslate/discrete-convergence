# Analytics Engine — CED Project Instructions

## Project Overview

Multi-tenant analytics dashboard built with NestJS 11 (backend), Next.js 15 (frontend),
and a shared TypeScript package, managed via Turborepo + pnpm workspaces.

## Architecture

- **apps/api** — NestJS 11 backend with Prisma ORM, JWT auth, RBAC, tenant isolation
- **apps/web** — Next.js 15 App Router with shadcn/ui, server actions, accessibility
- **packages/shared** — Shared constants, utilities, types consumed by both apps

## Tech Stack

| Component       | Technology         | Version Constraint   |
|-----------------|--------------------|----------------------|
| Backend         | NestJS             | ^11.0.0              |
| ORM             | Prisma             | >=6.0.0 <7.0.0      |
| Database        | PostgreSQL         | 16+                  |
| Frontend        | Next.js            | ^15.0.0              |
| UI              | shadcn/ui          | 8+ components        |
| Monorepo        | Turborepo          | ^2.0.0               |
| Package Manager | pnpm               | workspaces           |
| Auth            | JWT + bcryptjs     | salt rounds 12       |
| Logger          | Pino               | structured JSON      |

## Critical Rules

### Type Safety
- Zero `as any` casts — use proper Prisma types, string literals, generics
- Zero `|| fallback` for env vars — use `??` (nullish coalescing) instead
- Zero `console.log` in production code — use Pino logger

### Security
- JWT expiry <= 1 hour, no hardcoded secret fallback
- bcryptjs (NOT bcrypt) to eliminate native dependency vulnerabilities
- Helmet CSP with all required directives
- CORS with explicit origin from env var (no fallback)
- ValidationPipe with whitelist + forbidNonWhitelisted + transform
- All string DTOs: @IsString() + @MaxLength(); UUID DTOs: @MaxLength(36)

### Traceability (CED Methodology)
- TRACED tags ONLY in .ts/.tsx files (never .prisma, .json, .yaml, .css)
- VERIFY tags ONLY in spec .md files
- 100% bidirectional parity: every VERIFY has a matching TRACED, and vice versa
- Tag format: AE-{DOMAIN}-{NNN} (e.g., AE-AUTH-001, AE-API-002)

### Testing
- >= 30 test cases in apps/api/test/
- Behavioral assertions (toHaveBeenCalledWith), assertion density >= 1.5
- No inline fixture components in frontend tests — import from app source
- jest-axe for accessibility testing

### Frontend Integration
- Server actions store token in httpOnly cookie after login
- Protected actions read token from cookies, pass as Bearer header
- API route constants use single-quoted strings (FI scorer detection)

### Database
- RLS policies match column types (TEXT = TEXT, no ::uuid cast on TEXT)
- @@index on tenantId for all domain tables
- SET LOCAL for migration safety during RLS policy creation

### Monitoring
- MonitoringController: ALL methods @Public() + @SkipThrottle()
- GlobalExceptionFilter includes correlationId, no stack traces
- RequestLoggingMiddleware uses Pino + formatLogEntry from shared

## Commands

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm turbo run build

# Run tests
pnpm turbo run test

# Lint
pnpm turbo run lint

# Type check
pnpm turbo run typecheck

# Dev mode
pnpm turbo run dev
```

## Project Structure

```
analytics-engine/
├── apps/
│   ├── api/          # NestJS 11 backend
│   │   ├── prisma/   # Schema, migrations, seed
│   │   ├── src/      # Source code (auth, dashboard, widget, data-source, monitoring)
│   │   └── test/     # Integration + unit tests
│   └── web/          # Next.js 15 frontend
│       ├── app/      # App Router pages
│       ├── components/ # UI components (shadcn/ui)
│       ├── lib/      # Utils, server actions
│       └── __tests__/ # Accessibility + keyboard tests
├── packages/
│   └── shared/       # Shared constants, utilities, types
├── specs/            # CED specification documents
├── Dockerfile        # Multi-stage production build
├── docker-compose.yml
└── turbo.json
```
