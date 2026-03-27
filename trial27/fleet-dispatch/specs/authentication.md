# Authentication Specification

## Overview
JWT-based authentication with bcryptjs password hashing and Passport integration.

### VERIFY: FD-AUTH-001 — JWT token issued on login
The POST /auth/login endpoint returns a signed JWT token containing sub (userId), email, tenantId, and role claims. The token is signed using the JWT_SECRET environment variable with an expiry of 24h.
The response body is `{ accessToken: string }`.
Edge case: If the user is not found, the service throws `UnauthorizedException` with "Invalid credentials".
Edge case: If the password does not match the stored hash, the same generic error is returned to prevent user enumeration.
The token is used for all subsequent authenticated API requests via the Authorization header.
The `sub` claim follows the JWT standard for subject identification (RFC 7519).
Token validation is handled by the JWT strategy (see FD-AUTH-003 for public route bypass).

### VERIFY: FD-AUTH-002 — Login endpoint rate-limited
The POST /auth/login endpoint has `@Throttle({ short: { ttl: 1000, limit: 10 } })` to prevent brute-force attacks.
This limits to 10 login attempts per second per IP address.
Exceeding the limit returns HTTP 429 Too Many Requests.
The global ThrottlerModule provides baseline rate limiting (see [security.md](security.md) for configuration).
This per-endpoint throttle is stricter than the global limit to protect the authentication flow.
Failed login attempts within the window are counted toward the limit regardless of the target email.
The rate limit resets after the TTL window expires.

### VERIFY: FD-AUTH-003 — Public routes bypass JWT guard
Routes decorated with `@Public()` are excluded from JWT authentication via the JwtAuthGuard's canActivate method checking the IS_PUBLIC_KEY metadata.
The `@Public()` decorator uses `SetMetadata(IS_PUBLIC_KEY, true)` from NestJS.
Public routes include: POST /auth/login, POST /auth/register, GET /health, GET /health/ready.
All other routes require a valid JWT Bearer token in the Authorization header.
See [security.md](security.md) for the global APP_GUARD configuration.

### VERIFY: FD-AUTH-004 — Tenant ID extracted from JWT
The `@TenantId()` decorator extracts the tenantId from the JWT payload (set by JwtStrategy.validate) and passes it to controller methods for tenant-scoped queries.
This ensures all data access is automatically scoped to the authenticated user's tenant.
The decorator uses `createParamDecorator` and reads from `request.user.tenantId`.
If the tenantId is missing from the token (malformed JWT), the request will fail at the service layer.
The decorator is used on all controller methods that perform tenant-scoped database queries.
This pattern ensures consistent tenant isolation without manual extraction from the request object.

### VERIFY: FD-AUTH-005 — bcryptjs with 12 salt rounds
Password hashing uses bcryptjs (not bcrypt native) with BCRYPT_SALT_ROUNDS = 12 from the shared package.
bcryptjs is preferred over the native bcrypt package to avoid node-gyp build dependencies.
The `bcrypt.compare()` function is used during login to verify the plaintext password against the stored hash.
12 salt rounds provide a good balance between security and performance (~250ms per hash operation).
The `bcrypt.compare()` function is timing-safe to prevent timing-based side-channel attacks.

### VERIFY: FD-AUTH-006 — Registration creates tenant and user atomically
The register endpoint creates both a Tenant and User within a Prisma $transaction to ensure atomicity. The user is assigned the 'admin' role.
The transaction ensures that if user creation fails, the tenant is also rolled back.
The tenant slug is derived from the organization name (lowercased, hyphenated).
Edge case: If the email already exists for the tenant, the transaction is rolled back and a 409 Conflict is returned.
The newly created user receives a JWT token immediately, allowing seamless redirect to the dashboard.
The tenant name is stored as-is while the slug is normalized (lowercased with special characters replaced).
After registration, the JWT token is returned immediately so the client can redirect to the dashboard.
The admin role grants full CRUD access to all resources within the tenant.
Future enhancement: Additional roles (dispatcher, viewer) can be added to the UserRole enum.
