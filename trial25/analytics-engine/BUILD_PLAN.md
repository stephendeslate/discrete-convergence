# Analytics Engine — Build Plan

## Phase 0: Foundation

### 0.1 Monorepo Setup
- [x] pnpm-workspace.yaml with apps/* and packages/*
- [x] turbo.json with build/lint/typecheck/test pipelines
- [x] Root package.json with pnpm.overrides (effect>=3.20.0, picomatch>=4.0.4)
- [x] ESLint 9 flat config (eslint.config.mjs)

### 0.2 Shared Package
- [x] @repo/shared with constants, types, utilities
- [x] createCorrelationId, sanitizeLogContext, validateEnvVars, clampPagination
- [x] PaginationParams, PaginatedResult types
- [x] Unit tests with Jest

### 0.3 Prisma Schema
- [x] 6 models: User, Dashboard, Widget, DataSource, SyncHistory, AuditLog
- [x] 4 enums: UserRole, WidgetType, DataSourceType, SyncStatus
- [x] @@map on all models, @map on all enum values
- [x] @@index on all FK and tenantId fields
- [x] Migration with RLS ENABLE + FORCE + CREATE POLICY

## Phase 1: API Core

### 1.1 Infrastructure
- [x] PrismaService with setTenantContext ($executeRaw)
- [x] GlobalExceptionFilter with correlation ID
- [x] CorrelationInterceptor
- [x] ResponseTimeInterceptor
- [x] TenantGuard

### 1.2 Authentication
- [x] AuthService: register, login, refresh with bcryptjs (salt 12)
- [x] JwtStrategy with passport-jwt
- [x] DTOs with @MaxLength on all strings
- [x] @Throttle on login endpoint

### 1.3 Domain Modules
- [x] DashboardService/Controller: CRUD + getData
- [x] WidgetService/Controller: CRUD + getWidgetData (switch/case)
- [x] DataSourceService/Controller: CRUD + sync + testConnection (switch/case)
- [x] SyncHistoryService/Controller: read-only
- [x] AuditLogService/Controller: read-only + create

### 1.4 App Module
- [x] ThrottlerModule.forRoot limit >= 20000
- [x] APP_GUARD, APP_FILTER, APP_INTERCEPTOR providers
- [x] Helmet with CSP in main.ts
- [x] enableShutdownHooks()

## Phase 2: Frontend

### 2.1 Setup
- [x] Next.js 15 with App Router
- [x] Tailwind CSS configuration
- [x] cn() utility with clsx + tailwind-merge

### 2.2 Pages
- [x] 10 routes: /, login, register, dashboard, data-sources, widgets, analytics, reports, embed, settings

### 2.3 Components
- [x] NavBar, 3 form components, 3 list components, ErrorBoundary, LoadingSkeleton

### 2.4 Server Actions
- [x] lib/actions.ts with 'use server' directive
- [x] 8 server actions for CRUD operations

## Phase 3: Testing

### 3.1 Unit Tests
- [x] Co-located .spec.ts files for all services, controllers, utilities
- [x] Jest with collectCoverage: true

### 3.2 Integration Tests
- [x] auth.integration.spec.ts
- [x] dashboard.integration.spec.ts
- [x] data-source.integration.spec.ts
- [x] widget.integration.spec.ts
- [x] edge-cases.spec.ts (12 edge case tests)
- [x] security.spec.ts
- [x] performance.spec.ts

## Phase 4: Infrastructure

### 4.1 Docker
- [x] Multi-stage Dockerfile with HEALTHCHECK and LABEL
- [x] docker-compose.yml with api + postgres
- [x] docker-compose.test.yml

### 4.2 CI/CD
- [x] GitHub Actions ci.yml workflow

## Phase 5: Documentation

### 5.1 Specs
- [x] SPEC-INDEX.md (>= 55 lines)
- [x] 12 specification documents with VERIFY tags
- [x] edge-cases.md with >= 10 edge-case VERIFYs

### 5.2 Project Files
- [x] CLAUDE.md
- [x] BUILD_PLAN.md
- [x] .env.example
- [x] .dockerignore
