# Specification Index — Event Management

## Spec Files

| File | Domain | VERIFY Tags |
|------|--------|-------------|
| [auth.md](auth.md) | Authentication & Authorization | EM-AUTH-001 through EM-AUTH-006 |
| [security.md](security.md) | Security Architecture | EM-SEC-001 through EM-SEC-005 |
| [monitoring.md](monitoring.md) | Observability & Health | EM-MON-001 through EM-MON-009 |
| [performance.md](performance.md) | Performance & Pagination | EM-PERF-003 through EM-PERF-005 |
| [data.md](data.md) | Data Layer & ORM | EM-DATA-001, EM-DATA-003 through EM-DATA-005 |
| [events.md](events.md) | Domain Entities | EM-EVENT-001/002, EM-VENUE-001/002, EM-ATTENDEE-001/002, EM-REG-001/002 |
| [infrastructure.md](infrastructure.md) | Infra & Shared Package | EM-INFRA-001/002, EM-SHARED-001/002 |
| [frontend.md](frontend.md) | Frontend & Cross-Layer | EM-FI-001, EM-UI-001/002, EM-CROSS-001 |
| [edge-cases.md](edge-cases.md) | Edge Cases | EC-AUTH-001 through EC-SEC-004 (26 entries) |

## VERIFY Tag Summary

### Auth (6 tags)
- EM-AUTH-001 — Password hashing with bcryptjs
- EM-AUTH-002 — Duplicate email check before registration
- EM-AUTH-003 — RegisterDto validation with allowed roles
- EM-AUTH-004 — bcryptjs library usage (not native bcrypt)
- EM-AUTH-005 — Rate limiting on auth endpoints (3/sec)
- EM-AUTH-006 — JWT expiry configured to 1 hour

### Security (5 tags)
- EM-SEC-001 — @Public() decorator with IS_PUBLIC_KEY
- EM-SEC-002 — @Roles() decorator with ROLES_KEY
- EM-SEC-003 — RolesGuard role matching logic
- EM-SEC-004 — JWT extraction from Bearer header
- EM-SEC-005 — JwtAuthGuard public route bypass

### Monitoring (9 tags)
- EM-MON-001 — Correlation ID generation (randomUUID)
- EM-MON-002 — LogEntry interface structure
- EM-MON-003 — formatLogEntry JSON output
- EM-MON-004 — Log sanitization (recursive redaction)
- EM-MON-005 — GlobalExceptionFilter correlation ID
- EM-MON-006 — CorrelationIdMiddleware header management
- EM-MON-007 — RequestLoggingMiddleware structured logging
- EM-MON-008 — RequestContextService request scope
- EM-MON-009 — Health endpoints public, no @SkipThrottle

### Performance (3 tags)
- EM-PERF-003 — Pagination MAX_PAGE_SIZE clamping
- EM-PERF-004 — Pagination DEFAULT_PAGE_SIZE fallback
- EM-PERF-005 — X-Response-Time interceptor

### Data (4 tags)
- EM-DATA-001 — Event service Prisma CRUD
- EM-DATA-003 — Registration tenant filtering
- EM-DATA-004 — PrismaService onModuleInit
- EM-DATA-005 — setTenantContext $executeRaw

### Domain Entities (8 tags)
- EM-EVENT-001 — Event service CRUD + tenant isolation
- EM-EVENT-002 — Event controller RBAC
- EM-VENUE-001 — Venue service CRUD + tenant isolation
- EM-VENUE-002 — Venue controller RBAC
- EM-ATTENDEE-001 — Attendee service CRUD + tenant isolation
- EM-ATTENDEE-002 — Attendee controller RBAC
- EM-REG-001 — Registration service CRUD + tenant isolation
- EM-REG-002 — Registration controller endpoints

### Infrastructure (2 tags)
- EM-INFRA-001 — Environment variable validation
- EM-INFRA-002 — main.ts bootstrap configuration

### Shared (2 tags)
- EM-SHARED-001 — Shared constants export
- EM-SHARED-002 — Shared index re-exports

### Frontend & Integration (3 tags)
- EM-FI-001 — Server action cookie-based auth
- EM-UI-001 — cn() utility function
- EM-UI-002 — Layout accessibility (lang, title)

### Cross-Layer (1 tag)
- EM-CROSS-001 — AppModule global provider wiring

## Total: 43 VERIFY tags + 26 edge-case VERIFY tags = 69 total VERIFY entries
