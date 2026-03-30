# Fleet Dispatch

## Overview

Fleet Dispatch is a multi-tenant field service dispatch platform built for Trial 4 of the
Convergence Engineering Development (CED) discrete-convergence experiment. It manages work
orders, tracks technicians, optimizes routes, and handles invoicing for field service companies.

- **Domain:** Field service dispatch & fleet management
- **Trial:** 4 (discrete-convergence)
- **Layers:** L0-L9 (all 10 layers)
- **Version:** 0.1.0 (APP_VERSION from @fleet-dispatch/shared)

## Architecture

Turborepo monorepo with pnpm workspaces:

```
fleet-dispatch/
  apps/api/      — NestJS 11 backend (port 3001)
  apps/web/      — Next.js 15 frontend (port 3000)
  packages/shared/ — Shared constants, utilities, types
  specs/         — 7+ specification documents with VERIFY tags
```

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend | NestJS 11 + Prisma 6 + PostgreSQL 16 |
| Frontend | Next.js 15 + React 19 + Tailwind CSS 4 |
| UI | shadcn/ui (9 components) |
| Auth | JWT + bcrypt (salt rounds: 12) |
| Logger | Pino (structured JSON) |
| Monorepo | Turborepo 2 + pnpm workspaces |
| Runtime | Node.js 20 (Alpine) |

## Domain Entities

- **Company** — Tenant with name, branding
- **User** — Authenticated user with role (ADMIN, DISPATCHER, TECHNICIAN, CUSTOMER)
- **Technician** — Field worker with skills, GPS position, availability (1:1 with User)
- **Customer** — Service recipient with geocoded address
- **WorkOrder** — Central entity with 9-state machine, priority, scheduled time
- **WorkOrderStatusHistory** — Immutable audit trail of status transitions
- **Route** — Optimized daily route for a technician
- **RouteStop** — Ordered stop within a route
- **JobPhoto** — Photo captured on-site
- **Invoice** — Generated from work order line items (DRAFT/SENT/PAID/VOID)
- **LineItem** — Labor, material, flat, discount, or tax entry
- **AuditLog** — Immutable compliance record

## Key Design Decisions

- **Auth:** JWT + bcrypt with BCRYPT_SALT_ROUNDS=12 from shared. ADMIN excluded from registration.
- **Security:** Helmet CSP, ThrottlerGuard (default + auth configs), CORS from env, ValidationPipe with whitelist + forbidNonWhitelisted.
- **Monitoring:** Pino logger (DI-injectable), CorrelationIdMiddleware, RequestLoggingMiddleware, GlobalExceptionFilter as APP_FILTER, /health + /health/ready + /metrics endpoints.
- **Performance:** ResponseTimeInterceptor as APP_INTERCEPTOR, pagination with clamping (MAX_PAGE_SIZE=100), Cache-Control on list endpoints, database indexes.
- **Frontend:** Dark mode via @media (prefers-color-scheme: dark), cn() with clsx + tailwind-merge, loading.tsx with role="status" + aria-busy, error.tsx with role="alert" + useRef + focus management.
- **Data:** Decimal(12,2) for money, Decimal(10,7) for GPS. All models use @@map. All enums use @@map + @map. RLS enabled on all tenant tables.

## Code Conventions

- Zero `as any` type assertions
- Zero `console.log` in apps/api/src/
- Zero `|| 'value'` env var fallbacks
- Zero `$executeRawUnsafe`
- Zero `dangerouslySetInnerHTML`
- All `findFirst` in *.service.ts have justification comments
- TRACED tags only in .ts/.tsx files

## Testing Strategy

- **Unit tests:** auth.service.spec, work-order.service.spec, invoice.service.spec (mocked Prisma)
- **Integration tests:** auth.integration.spec, work-order.integration.spec (supertest + real AppModule)
- **Cross-layer:** cross-layer.integration.spec (full pipeline verification)
- **Monitoring:** monitoring.spec (supertest integration)
- **Security:** security.spec (supertest + helmet verification)
- **Performance:** performance.spec (response time, metrics)
- **Accessibility:** accessibility.spec.tsx (jest-axe)
- **Keyboard:** keyboard.spec.tsx (userEvent)
- **Sanitizer:** log-sanitizer.spec.ts (including arrays)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | Yes | PostgreSQL connection string with connection_limit |
| JWT_SECRET | Yes | Secret for JWT signing |
| CORS_ORIGIN | Yes | Allowed CORS origin |
| PORT | No | Server port (default: 3001) |

## Commands

```bash
pnpm install          # Install dependencies
pnpm turbo run build  # Build all packages
pnpm turbo run test   # Run all tests
pnpm turbo run typecheck # TypeScript checks
pnpm turbo run lint   # Lint all packages
```

## VERIFY/TRACED Tag Conventions

- **Prefix:** FD- (Fleet Dispatch)
- **VERIFY tags:** specs/*.md only
- **TRACED tags:** .ts/.tsx files only
- **Minimum:** 35 VERIFY tags with 100% bidirectional parity
