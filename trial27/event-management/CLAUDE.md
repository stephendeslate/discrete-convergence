# Event Management Platform

## Overview
Multi-tenant event management platform built with NestJS 11 + Prisma 6 + PostgreSQL 16 (API) and Next.js 15 + React 19 + Tailwind CSS 4 (Web).

## Architecture
- **Monorepo**: Turborepo 2 + pnpm workspaces
- **apps/api**: NestJS 11 backend with Prisma ORM, JWT auth, RLS
- **apps/web**: Next.js 15 App Router frontend with shadcn/ui
- **packages/shared**: Shared constants, utilities, and types

## Key Commands
```bash
pnpm install                                          # Install dependencies
pnpm --filter @event-management/api exec prisma generate  # Generate Prisma client
pnpm --filter @event-management/api exec tsc --noEmit     # Type check API
pnpm --filter @event-management/api test                  # Run API tests
pnpm build                                            # Build all packages
pnpm lint                                             # Lint all packages
```

## Important Conventions
- bcryptjs (NOT bcrypt) with 12 salt rounds
- ThrottlerModule limit: 20000
- ESLint 9 flat config (eslint.config.mjs)
- Health endpoint at /health (public)
- All findFirst calls need justification comments
- Prisma models use @@map/@map for snake_case
- All string DTO fields have @MaxLength decorators
- TRACED comments link source to spec VERIFY entries
