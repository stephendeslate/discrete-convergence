# Analytics Engine

Multi-tenant analytics dashboard platform built with NestJS, Next.js, and Prisma.

## Version
APP_VERSION: 1.0.0

## Tech Stack
- **Backend:** NestJS 11, Prisma 6, PostgreSQL 16
- **Frontend:** Next.js 15, React 19, Tailwind CSS 4, shadcn/ui
- **Auth:** JWT + bcryptjs (salt rounds: 12)
- **Monorepo:** Turborepo + pnpm workspaces

## Development
```bash
pnpm install
pnpm turbo run build
pnpm turbo run test
pnpm turbo run lint
pnpm turbo run typecheck
```

## Project Structure
- `apps/api/` — NestJS backend API
- `apps/web/` — Next.js frontend
- `packages/shared/` — Shared utilities and constants
- `specs/` — Project specifications with VERIFY tags

## Conventions
- Zero `as any` — use proper types
- Zero `console.log` in API source — use Pino logger
- Environment fallbacks use `??` not `||`
- All VERIFY/TRACED tags use `AE-{DOMAIN}-{NNN}` format
