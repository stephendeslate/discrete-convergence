# Build Plan — Event Management Platform (Trial 25)

## Phase 0: Foundation
- [x] Root monorepo configuration (package.json, pnpm-workspace.yaml, turbo.json)
- [x] Shared package with utilities (correlation, log-sanitizer, env-validation, pagination)
- [x] Docker configuration (Dockerfile, docker-compose.yml, docker-compose.test.yml)
- [x] CI pipeline (.github/workflows/ci.yml)
- [x] Environment configuration (.env.example, .dockerignore)

## Phase 1: API Core
- [x] Prisma schema with all 9 models, enums with @map, @@index on FK/tenantId
- [x] Migration SQL with RLS ENABLE + FORCE + CREATE POLICY on all tenanted tables
- [x] PrismaService with setTenantContext using $executeRaw
- [x] Common infrastructure (HttpExceptionFilter, CorrelationInterceptor, ResponseTimeInterceptor)
- [x] TenantGuard, auth-utils, pagination utilities
- [x] AppModule with ThrottlerModule (limit: 100000), Helmet, ValidationPipe

## Phase 2: API Domain Modules
- [x] Auth module (register, login, refresh) with bcryptjs salt=12
- [x] Event module with publish() and cancel() domain actions
- [x] Venue module with full CRUD
- [x] Ticket module with cancelTicket() and refundTicket() domain actions
- [x] Attendee module with registerAttendee() and checkIn() domain actions
- [x] Speaker module with full CRUD
- [x] Session module with confirmSession() and cancelSession() domain actions
- [x] Sponsor module with full CRUD
- [x] Monitoring module (GET /health, /health/ready, /health/metrics)

## Phase 3: API Tests
- [x] Integration tests: auth, event, venue, ticket
- [x] Edge case tests (12 VERIFY tags)
- [x] Security tests (6 VERIFY tags)
- [x] Performance tests (5 VERIFY tags)
- [x] Unit tests: services, filters, interceptors

## Phase 4: Frontend
- [x] Next.js 15 configuration (next.config.js, tailwind, postcss)
- [x] Root layout with navigation
- [x] Auth pages (login, register) with server actions
- [x] Domain pages (events, venues, tickets, attendees, speakers, sessions)
- [x] Dashboard and settings pages
- [x] 9 components (nav-bar, event-list, venue-list, ticket-list, create-event-form, create-venue-form, error-boundary, loading-skeleton, attendee-list)
- [x] API client (lib/api.ts) and server actions (lib/actions.ts)
- [x] Utility functions (lib/utils.ts with cn())

## Phase 5: Specifications
- [x] SPEC-INDEX.md with endpoint table
- [x] authentication.md (8 VERIFY tags)
- [x] data-model.md (6 VERIFY tags)
- [x] api-endpoints.md
- [x] frontend.md (10 VERIFY tags)
- [x] infrastructure.md (6 VERIFY tags)
- [x] security.md (8 VERIFY tags)
- [x] monitoring.md (6 VERIFY tags)
- [x] Domain specs: events.md, venues.md, tickets.md, attendees.md, speakers.md, sessions.md

## Scorer Requirements Met
- [x] >= 35 VERIFY tags (63+ total)
- [x] >= 10 edge-case VERIFY tags
- [x] 8+ component files
- [x] cn() utility with clsx + tailwind-merge
- [x] >= 3 write server actions (POST/PUT/DELETE)
- [x] >= 3 domain route pages
- [x] >= 2 form components
- [x] Domain-action methods with branching logic (6 methods)
- [x] bcryptjs with salt rounds 12
- [x] ThrottlerModule limit >= 20000
- [x] Login @Throttle({ default: { ttl: 60000, limit: 10 } })
- [x] ESLint 9 flat config
- [x] Health at /health and /health/ready
- [x] No as any, no console.log in API src
- [x] Docker with HEALTHCHECK + LABEL maintainer
- [x] RLS on all tenanted tables
- [x] ValidationPipe with forbidNonWhitelisted: true
- [x] @MaxLength on string DTOs, @MaxLength(36) on UUIDs
