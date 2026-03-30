# Event Management — Specification Index

> **Version:** 1.0.0
> **Project:** Event Management Platform
> **Total VERIFY tags:** 42
> **Minimum required:** 35

## Spec Files

| File | Category | Tags | Range |
|------|----------|------|-------|
| [authentication.md](authentication.md) | AUTH | 5 | EM-AUTH-001 → EM-AUTH-005 |
| [data-model.md](data-model.md) | DATA | 8 | EM-DATA-001 → EM-DATA-008 |
| [api-endpoints.md](api-endpoints.md) | API | 6 | EM-API-001 → EM-API-006 |
| [frontend.md](frontend.md) | FE | 5 | EM-FE-001 → EM-FE-005 |
| [infrastructure.md](infrastructure.md) | INFRA | 4 | EM-INFRA-001 → EM-INFRA-004 |
| [security.md](security.md) | SEC | 4 | EM-SEC-001 → EM-SEC-004 |
| [monitoring.md](monitoring.md) | MON | 5 | EM-MON-001 → EM-MON-005 |
| [cross-layer.md](cross-layer.md) | CROSS | 4 + 1 TEST | EM-CROSS-001 → EM-CROSS-004, EM-TEST-001 |

## Tag Registry

### Authentication (EM-AUTH)
- **EM-AUTH-001**: JWT access + refresh token strategy with bcrypt password hashing
- **EM-AUTH-002**: Registration DTO with class-validator decorators and role whitelist
- **EM-AUTH-003**: Auth controller with register/login/refresh endpoints
- **EM-AUTH-004**: Global APP_GUARD chain (ThrottlerGuard + JwtAuthGuard)
- **EM-AUTH-005**: @Public() decorator with SetMetadata for route-level auth bypass

### Data Model (EM-DATA)
- **EM-DATA-001**: All Prisma models use @@map("snake_case") for PostgreSQL table names
- **EM-DATA-002**: Event model with status enum lifecycle and timezone field
- **EM-DATA-003**: Registration model with status machine and ticket type reference
- **EM-DATA-004**: Ticket prices as Int (cents) with Decimal for display calculations
- **EM-DATA-005**: Enum values with @map/@map for PostgreSQL naming conventions
- **EM-DATA-006**: $executeRaw with Prisma.sql template for RLS SET LOCAL
- **EM-DATA-007**: Composite @@index on (organizationId, status) and relationship includes
- **EM-DATA-008**: Seed script with realistic event lifecycle data and error handling

### API Endpoints (EM-API)
- **EM-API-001**: Event CRUD with status transition validation
- **EM-API-002**: Registration endpoint with capacity check and waitlist
- **EM-API-003**: Venue CRUD with capacity validation
- **EM-API-004**: DTO validation with class-validator decorators
- **EM-API-005**: Pagination with clampPagination helper
- **EM-API-006**: Cache-Control headers on list endpoints

### Frontend (EM-FE)
- **EM-FE-001**: Next.js App Router with shadcn/ui components and cn utility
- **EM-FE-002**: Loading state with role=status and aria-busy=true
- **EM-FE-003**: Error boundary with role=alert, useRef, and focus management
- **EM-FE-004**: Dark mode via @media prefers-color-scheme in globals.css
- **EM-FE-005**: Server actions with 'use server' directive

### Infrastructure (EM-INFRA)
- **EM-INFRA-001**: Multi-stage Dockerfile with deps/build/production stages
- **EM-INFRA-002**: CI/CD with GitHub Actions and PostgreSQL 16 service
- **EM-INFRA-003**: Docker Compose with PostgreSQL 16 and Redis 7
- **EM-INFRA-004**: Environment validation at startup with validateEnvVars

### Security (EM-SEC)
- **EM-SEC-001**: Helmet middleware with CSP configuration
- **EM-SEC-002**: ThrottlerModule with named rate limit configs
- **EM-SEC-003**: CORS from environment variable
- **EM-SEC-004**: ValidationPipe with whitelist and forbidNonWhitelisted

### Monitoring (EM-MON)
- **EM-MON-001**: Pino structured logging in request middleware
- **EM-MON-002**: Correlation ID middleware with createCorrelationId
- **EM-MON-003**: Health endpoints (basic + ready + metrics)
- **EM-MON-004**: GlobalExceptionFilter with sanitizeLogContext
- **EM-MON-005**: ResponseTimeInterceptor with X-Response-Time header

### Cross-Layer (EM-CROSS)
- **EM-CROSS-001**: Provider chain (APP_GUARD + APP_FILTER + APP_INTERCEPTOR)
- **EM-CROSS-002**: Shared package barrel with exactly 8 consumed exports
- **EM-CROSS-003**: Integration test covering auth → event creation → registration
- **EM-CROSS-004**: Both apps import from shared package

### Testing (EM-TEST)
- **EM-TEST-001**: Shared integration test setup to reduce boilerplate
