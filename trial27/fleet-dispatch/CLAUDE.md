# Fleet Dispatch Platform

## Overview
Multi-tenant fleet management platform for dispatching vehicles, managing drivers, and tracking maintenance.

## Architecture
- **Monorepo**: Turborepo 2 + pnpm workspaces
- **Backend**: NestJS 11 + Prisma 6 + PostgreSQL 16 with Row-Level Security
- **Frontend**: Next.js 15 App Router + React 19 + Tailwind CSS 4 + shadcn/ui
- **Packages**: apps/api, apps/web, packages/shared

## Key Commands
```bash
pnpm install                                          # Install dependencies
pnpm --filter @fleet-dispatch/api exec prisma generate # Generate Prisma client
pnpm --filter @fleet-dispatch/api exec tsc --noEmit   # Type check API
pnpm --filter @fleet-dispatch/api test                 # Run API tests
pnpm build                                            # Build all packages
```

## Important Patterns
- All tenanted tables have RLS policies enforced in migrations
- bcryptjs with 12 salt rounds (from shared constants)
- ThrottlerModule limit: 20000 (high for load testing)
- JWT auth with PassportModule, global guards
- All string DTO fields have @MaxLength validators
- findFirst calls have justification comments
- Prisma schema uses @@map/@map for snake_case

## Test Strategy
- Unit tests: co-located in src/ (*.spec.ts)
- Integration tests: test/ directory (need running DB)
- Frontend tests: __tests__/ directory
