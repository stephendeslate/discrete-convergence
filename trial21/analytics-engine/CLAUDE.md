# Analytics Engine — CLAUDE.md

## Project Overview

Multi-tenant embeddable analytics platform built with NestJS 11, Next.js 15, and Prisma 6.
Supports data sources, dashboards, widgets, SSE real-time, Recharts charts, and embed API.

## Architecture

- **Monorepo**: pnpm workspaces + Turborepo
- **Backend**: NestJS 11 (apps/api) — REST API with JWT auth, RBAC, multi-tenancy
- **Frontend**: Next.js 15 (apps/web) — SSR with server actions, Recharts visualization
- **Shared**: packages/shared — constants, utilities, validators
- **Database**: PostgreSQL via Prisma 6 with Row Level Security

## Quick Commands

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

# Start API (dev)
cd apps/api && pnpm run start:dev

# Start Web (dev)
cd apps/web && pnpm run dev

# Docker
docker compose up -d
```

## Key Directories

- `apps/api/src/` — NestJS API source
- `apps/api/prisma/` — Prisma schema and migrations
- `apps/web/app/` — Next.js app router pages
- `apps/web/components/` — React components
- `apps/web/lib/` — Server actions and utilities
- `packages/shared/src/` — Shared constants and utilities
- `specs/` — Specification documents with VERIFY tags

## Domain Entities

Tenant, User, Dashboard (DRAFT/PUBLISHED/ARCHIVED), Widget (7 types),
DataSource (REST/PostgreSQL/CSV/Webhook), DataSourceConfig, FieldMapping,
SyncRun, DataPoint, AggregatedDataPoint, EmbedConfig, QueryCache,
DeadLetterEvent, ApiKey, AuditLog

## VERIFY Tag Prefix

All VERIFY tags use the `AE-` prefix (e.g., AE-AUTH-001, AE-DASH-001).
Tags are plain text (not markdown bold) in .ts/.tsx source files.

## Security Requirements

- Global JwtAuthGuard + ThrottlerGuard + RolesGuard via APP_GUARD
- Helmet with CSP frame-ancestors:'none'
- ValidationPipe with whitelist + forbidNonWhitelisted
- bcryptjs (NOT bcrypt) for password hashing
- JWT access tokens expire in 1 hour
- RLS with TEXT tenant_id comparison (no ::uuid cast)
- No hardcoded secret fallbacks
- No console.log in production code
- No `as any` casts
- No `|| 'fallback'` env patterns

## Test Conventions

- Co-located unit tests: `src/{module}/{module}.service.spec.ts`
- jest.config.js must NOT restrict tests to src/ only via testMatch/testRegex
- Coverage enabled with json-summary, text, lcov reporters
- Negative tests required for error cases
- Behavioral assertions (toHaveBeenCalledWith)

## API Route Prefixes

- auth → /auth/login, /auth/register, /auth/refresh
- dashboards → /dashboards
- widgets → /dashboards/:id/widgets
- data-sources → /data-sources
- data → /data/preview, /data/widget
- embed → /embed/config, /embed/stream
- api-keys → /api-keys
- audit-log → /audit-log
- health → /health, /health/ready
- metrics → /metrics

## Environment Variables

Required: DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET
Optional: PORT (default 3001), CORS_ORIGIN, API_URL

## Tier Limits

- FREE: 3 data sources, basic sync
- PRO: 20 data sources
- ENTERPRISE: unlimited data sources
- All tiers: max 20 widgets per dashboard
