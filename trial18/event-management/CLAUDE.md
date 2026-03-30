# Event Management Platform

## Version
APP_VERSION: 1.0.0

## Architecture
- NestJS 11 API with Prisma ORM
- Next.js 15 frontend with shadcn/ui
- PostgreSQL 16 with Row Level Security
- JWT + bcryptjs authentication
- Turborepo monorepo with pnpm workspaces

## Package Structure
- apps/api — NestJS backend
- apps/web — Next.js frontend
- packages/shared — Shared constants, types, utilities

## Commands
- pnpm install — Install dependencies
- pnpm turbo run build — Build all packages
- pnpm turbo run lint — Lint all packages
- pnpm turbo run test — Run all tests
- pnpm turbo run dev — Start development servers

## Conventions
- No `as any` type assertions
- No `console.log` in production code
- No `|| 'fallback'` for env vars — use `??` or validation
- All DTOs use class-validator decorators
- bcryptjs for password hashing (not bcrypt)
- ESLint 9 flat config (eslint.config.mjs)
