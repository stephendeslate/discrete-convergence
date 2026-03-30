# Authentication Specification

> **Project:** Event Management
> **Category:** AUTH
> **Cross-references:** See [security.md](security.md), [api-endpoints.md](api-endpoints.md)

---

## Requirements

### VERIFY:EM-AUTH-001 — JWT Authentication

JWT-based authentication with access tokens (15min expiry) and refresh tokens (7d expiry).
Passwords hashed with bcrypt using `BCRYPT_SALT_ROUNDS` from the shared package. Login
returns `{ accessToken, refreshToken }`. Refresh endpoint validates refresh token and
issues a new pair.

**Acceptance criteria:**
- Access token contains `sub` (userId), `tenantId` (organizationId), `role`
- Refresh token stored as a hashed value (never plaintext in DB or logs)
- Token expiry is validated server-side on every request
- Invalid or expired tokens return 401 Unauthorized
- `BCRYPT_SALT_ROUNDS` is imported from `@event-management/shared`, never hardcoded

### VERIFY:EM-AUTH-002 — Registration DTO

Registration DTO validates:
- `@IsEmail()` email
- `@IsString() @MinLength(8) @MaxLength(128)` password
- `@IsString() @MinLength(1) @MaxLength(100)` name
- `@IsIn(ALLOWED_REGISTRATION_ROLES)` role

`ALLOWED_REGISTRATION_ROLES` imported from shared package. ADMIN role is excluded from
registration — admin users are seeded or created by existing admins only.

**Edge cases:**
- Duplicate email returns 409 Conflict
- Password shorter than 8 characters returns 400 with field-level error
- Role not in allowed list returns 400 with validation message

### VERIFY:EM-AUTH-003 — Auth Controller

Auth controller exposes:
- `POST /auth/register` — creates user + organization
- `POST /auth/login` — validates credentials, returns tokens
- `POST /auth/refresh` — rotates tokens

All auth routes decorated with `@Public()` to bypass the global JwtAuthGuard.
Controller delegates all business logic to AuthService (no Prisma calls in controller).

### VERIFY:EM-AUTH-004 — Global Guard Chain

`APP_GUARD` provides two guards in order: `ThrottlerGuard` (rate limiting) then
`JwtAuthGuard` (JWT validation). Guards registered as global providers in AppModule
using `{ provide: APP_GUARD, useClass: ... }`. JwtAuthGuard checks `IS_PUBLIC_KEY`
metadata via Reflector to skip validation on public routes.

Domain controllers MUST NOT use `@UseGuards(JwtAuthGuard)` — the global guard handles
all authentication. See [security.md](security.md) for rate limiting configuration.

### VERIFY:EM-AUTH-005 — Public Decorator

`@Public()` decorator uses `SetMetadata(IS_PUBLIC_KEY, true)` to mark routes that bypass
JWT authentication. Applied to: auth endpoints, public event discovery, health and metrics
endpoints. The decorator is defined in `common/public.decorator.ts`.
