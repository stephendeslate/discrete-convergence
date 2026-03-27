# Analytics Engine

## Architecture
- **Backend**: NestJS 11 + Prisma 6 + PostgreSQL 16 with Row-Level Security
- **Frontend**: Next.js 15 App Router + React 19 + Tailwind CSS 4 + shadcn/ui
- **Monorepo**: Turborepo 2 + pnpm workspaces

## Quick Start
```bash
pnpm install
docker compose -f docker-compose.test.yml up -d
cd apps/api && npx prisma migrate deploy && npx prisma db seed
pnpm dev
```

## Testing
```bash
pnpm test          # All tests
pnpm --filter @analytics-engine/api test   # API only
pnpm --filter @analytics-engine/web test   # Web only
```

## Key Decisions
- bcryptjs (NOT bcrypt) with 12 salt rounds
- ThrottlerModule limit: 20000 requests/60s
- ESLint 9 flat config (eslint.config.mjs)
- Health endpoint at /health (public, no JWT)
- Docker compose service named "api"
- PORT: process.env.PORT ?? '3001'
