# Analytics Engine

Multi-tenant analytics dashboard platform built with NestJS 11, Next.js 15, and PostgreSQL.

## Version
APP_VERSION: 1.0.0

## Architecture
- **apps/api** — NestJS 11 backend with Prisma ORM, JWT auth, RBAC, tenant isolation
- **apps/web** — Next.js 15 frontend with App Router, shadcn/ui, server actions
- **packages/shared** — Shared constants, utilities, validators

## Commands
- `pnpm install` — Install dependencies
- `pnpm turbo run build` — Build all packages
- `pnpm turbo run test` — Run all tests
- `pnpm turbo run lint` — Lint all packages
- `pnpm turbo run typecheck` — TypeScript checks

## Key Conventions
- bcryptjs (not bcrypt) for password hashing
- Prisma pinned >=6.0.0 <7.0.0
- ESLint 9 flat config (eslint.config.mjs)
- Zero `as any`, zero `console.log` in app source
- All DTOs: @IsString() + @MaxLength()
- RLS on all tenant tables
- ThrottlerGuard + JwtAuthGuard + RolesGuard as APP_GUARD
- GlobalExceptionFilter as APP_FILTER
- ResponseTimeInterceptor as APP_INTERCEPTOR
