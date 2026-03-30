# Fleet Dispatch Build Plan

## Phase 0: Project Scaffold
- [x] Monorepo structure with pnpm workspace
- [x] Root package.json with turbo, jscpd, overrides
- [x] Shared package with constants and utilities
- [x] API package with NestJS 11
- [x] Web package with Next.js 15

## Phase 1: Data Model & Infrastructure
- [x] Prisma schema with all entities and enums
- [x] @@map on all models, @map on enum values
- [x] @@index on FK fields and tenantId
- [x] Migration SQL with RLS policies
- [x] PrismaService with setTenantContext

## Phase 2: API Implementation
- [x] Auth module (register, login, refresh) with bcryptjs
- [x] Vehicle CRUD + activate/deactivate with branching
- [x] Driver CRUD + status management with branching
- [x] Route CRUD
- [x] Dispatch state machine (dispatch, assign, complete, cancel)
- [x] Maintenance with vehicle status integration
- [x] Trip with dispatch validation
- [x] Zone CRUD
- [x] Monitoring endpoints (/health, /health/ready, /health/metrics)
- [x] Global guards, filters, interceptors
- [x] Helmet CSP, CORS, ValidationPipe

## Phase 3: Frontend
- [x] App layout with Tailwind CSS
- [x] Login/Register pages
- [x] Dashboard page
- [x] 7 domain route pages (vehicles, drivers, routes, dispatches, trips, maintenance, zones)
- [x] 9 components (nav-bar, vehicle-list, driver-list, route-list, dispatch-list, create-vehicle-form, create-dispatch-form, error-boundary, loading-skeleton)
- [x] cn() utility with clsx + tailwind-merge
- [x] Server actions with 'use server'
- [x] API client

## Phase 4: Testing
- [x] Unit tests co-located in src/
- [x] Integration tests in test/ with supertest
- [x] Edge case tests
- [x] Security tests
- [x] Performance tests

## Phase 5: DevOps
- [x] Dockerfile with multi-stage build, HEALTHCHECK, LABEL
- [x] docker-compose.yml with api service
- [x] docker-compose.test.yml
- [x] GitHub Actions CI
- [x] ESLint 9 flat config
