# Authentication Specification

## Overview
JWT-based authentication with Passport.js strategy, bcryptjs password hashing, and public/protected route separation.

### VERIFY: EM-AUTH-001 — JWT token issued on login
The login endpoint must return a JWT access token containing user ID, email, tenant ID, and role.
Implementation: `auth.service.ts` generates JWT via `JwtService.sign()`.
The payload shape is `{ sub: user.id, email: user.email, tenantId: user.tenantId, role: user.role }`.
Edge case: If the user is not found or the password is incorrect, the service throws `UnauthorizedException`.
The token is returned as `{ accessToken: string }` in the response body.
The `sub` claim follows the JWT standard for subject identification (RFC 7519).
Clients must store the token securely and include it in subsequent requests via the Authorization header.

### VERIFY: EM-AUTH-002 — Password hashed with bcryptjs and 12 salt rounds
All passwords must be hashed using bcryptjs (not bcrypt) with exactly 12 salt rounds.
The constant `BCRYPT_SALT_ROUNDS = 12` is imported from the shared package.
Implementation: `auth.service.ts` calls `bcrypt.hash(password, BCRYPT_SALT_ROUNDS)`.
Note: bcrypt (native) must NOT be used — bcryptjs is the pure-JS implementation that avoids native build issues.
Error handling: If hashing fails, the registration request returns a 500 Internal Server Error.

### VERIFY: EM-AUTH-003 — Public register and login endpoints
Both `/auth/register` and `/auth/login` endpoints must be decorated with `@Public()` to bypass JWT guard.
Implementation: `auth.controller.ts` uses `@Public()` decorator on both endpoints.
The `@Public()` decorator sets the `IS_PUBLIC_KEY` metadata, which the `JwtAuthGuard` checks in `canActivate()`.
Without this decorator, unauthenticated users would not be able to register or log in.
See [security.md](security.md) for details on the global JWT guard that these decorators bypass.

### VERIFY: EM-AUTH-004 — Login rate limiting
The login endpoint must have rate limiting: `@Throttle({ short: { ttl: 1000, limit: 10 } })`.
Implementation: `auth.controller.ts` applies `@Throttle` decorator to login.
This limits to 10 requests per second per IP to prevent brute-force password attacks.
The global ThrottlerModule (see [security.md](security.md)) provides the baseline rate limiting infrastructure.
Exceeding the limit returns HTTP 429 Too Many Requests.

### VERIFY: EM-AUTH-005 — JWT strategy validates token
The JWT strategy extracts bearer token from Authorization header and validates against `JWT_SECRET`.
Implementation: `jwt.strategy.ts` extends `PassportStrategy(Strategy)`.
The strategy configuration sets `jwtFromRequest: ExtractJwt.fromAuthBearerToken()` and `secretOrKey: process.env.JWT_SECRET`.
The `validate()` method receives the decoded payload and returns the user object attached to the request.
Invalid or expired tokens result in a 401 Unauthorized response.
The strategy also sets `ignoreExpiration: false` to enforce token expiry validation.
Tampered tokens (invalid signature) are rejected before the validate() method is called.

### VERIFY: EM-AUTH-006 — JWT expiry set to 24 hours
JWT tokens expire after 24 hours, configured via `JWT_EXPIRY` constant from shared package.
Implementation: `auth.module.ts` passes `signOptions: { expiresIn: JWT_EXPIRY }` to `JwtModule.register()`.
The `JWT_EXPIRY` value is `'24h'` as defined in `packages/shared/src/index.ts`.
After expiry, clients must re-authenticate to obtain a new token.
The expiry is verified automatically by the Passport JWT strategy during token validation.
Note: Refresh tokens are not implemented — the client must perform a full re-login after token expiry.
The 24-hour window balances security (limiting token exposure) with usability (avoiding frequent re-auth).
Token revocation is not supported; compromised tokens remain valid until natural expiry.
Future enhancement: Token blacklisting could be implemented using Redis for immediate revocation.
The JWT secret must be a strong random string of at least 32 characters for production deployments.
