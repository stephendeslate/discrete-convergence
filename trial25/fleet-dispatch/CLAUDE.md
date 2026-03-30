# Fleet Dispatch - Project Instructions

## Architecture
- NestJS 11 API + Next.js 15 frontend + shared package monorepo
- Multi-tenant with Row-Level Security (RLS) via Prisma
- pnpm workspace with turbo build orchestration

## Key Constraints
- bcryptjs (not bcrypt), salt rounds 12
- ThrottlerModule limit >= 20000
- ESLint 9 flat config (eslint.config.mjs)
- Health endpoints at /health and /health/ready
- PORT from env: process.env.PORT ?? '3001'
- No `as any` casts, no console.log in API src
- TRACED tags only in .ts/.tsx files
- Every findFirst() must have justification comment
- ValidationPipe with forbidNonWhitelisted: true

## Testing
- jest.config.js testMatch covers src/**/*.spec.ts AND test/**/*.spec.ts
- Integration tests use supertest with mocked PrismaService
- collectCoverage: true, coverageReporters: ['text', 'json-summary']

## Running
```bash
pnpm install
pnpm run build
pnpm run test
```
