# Analytics Engine

Multi-tenant embeddable analytics platform.

## Stack
- **API**: NestJS 11, Prisma 6, PostgreSQL 16 with RLS
- **Web**: Next.js 15 App Router, Tailwind CSS 4, shadcn/ui-style components
- **Monorepo**: Turborepo 2 + pnpm workspaces

## Key Commands
```bash
pnpm install              # Install dependencies
pnpm turbo build          # Build all packages
pnpm turbo lint           # Lint all packages
pnpm turbo typecheck      # Type check all packages
pnpm turbo test           # Run all tests
```

## Architecture
- `packages/shared` — Constants, utilities, types shared across apps
- `apps/api` — NestJS REST API with JWT auth, multi-tenant RLS
- `apps/web` — Next.js frontend with server actions

## Testing
- API unit tests: co-located in `src/**/*.spec.ts`
- API integration tests: `test/**/*.integration.spec.ts`
- Web tests: `__tests__/**/*.spec.tsx`
