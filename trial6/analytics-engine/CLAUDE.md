# Analytics Engine — Build Instructions

## Project Structure
- `apps/api/` — NestJS backend (port 4000)
- `apps/web/` — Next.js 15 frontend (port 3000)
- `packages/shared/` — Shared constants, utilities, types

## Commands
- `pnpm install` — Install all dependencies
- `pnpm run build` — Build all packages
- `pnpm run test` — Run all tests
- `pnpm run typecheck` — TypeScript type checking

## Conventions
- NO console.log — use Pino logger
- NO $executeRaw — use Prisma query builder
- Every findFirst() needs a justification comment
- Use `import type { X }` for type-only imports
- Use snake_case for DB columns (@@map), camelCase in code
