# Authentication Specification

## Overview

The Analytics Engine uses JWT-based authentication with bcryptjs password hashing and role-based access control (RBAC). Authentication is managed through the AuthModule with Passport.js integration.

See also: [security.md](security.md) for guard configuration, [api-endpoints.md](api-endpoints.md) for endpoint definitions.

## Authentication Flow

### Registration

Users register with email, password, tenantId, and role. Only roles in `ALLOWED_REGISTRATION_ROLES` (VIEWER) are permitted during self-registration. Admin users must be created through database seeding or admin-only endpoints.

VERIFY: AE-AUTH-001 — AuthModule registers JwtModule with Passport integration

VERIFY: AE-AUTH-002 — Registration validates role against ALLOWED_REGISTRATION_ROLES from shared package

VERIFY: AE-AUTH-003 — Login returns JWT access_token with user payload containing sub, email, role, tenantId

### Login

Login accepts email and password. The service uses findFirst to look up the user by email, then validates the password using bcrypt.compare. On success, a JWT is signed with user claims (sub, email, role, tenantId).

### JWT Strategy

VERIFY: AE-AUTH-004 — JwtStrategy validates JWT_SECRET from environment with validateEnvVars

The JWT strategy extracts tokens from the Authorization header using Bearer scheme. Token expiry is set to 1 hour maximum. The strategy validates the secret against the JWT_SECRET environment variable, which is validated at startup.

### DTO Validation

VERIFY: AE-AUTH-005 — RegisterDto enforces @IsEmail, @IsString, @MaxLength, @MinLength, @IsIn for role

Registration DTO requires:
- email: @IsEmail() + @IsString() + @MaxLength(255)
- password: @IsString() + @MinLength(8) + @MaxLength(128)
- tenantId: @IsString() + @MaxLength(36)
- role: @IsString() + @IsIn(ALLOWED_REGISTRATION_ROLES)

Login DTO requires:
- email: @IsEmail() + @IsString() + @MaxLength(255)
- password: @IsString() + @MaxLength(128)

## Security Considerations

- Passwords hashed with bcryptjs using BCRYPT_SALT_ROUNDS (12) from shared
- JWT tokens expire in 1 hour (not 24h or 7d)
- No hardcoded secret fallbacks for JWT_SECRET
- ADMIN role excluded from self-registration
- Validation pipe rejects extra fields (forbidNonWhitelisted)

## Token Lifecycle

### Issuance
JWT payload includes: sub (user ID), email, role, tenantId. The token is signed by JwtService using the secret from JWT_SECRET environment variable. Expiry is set via signOptions in JwtModule.register.

### Validation
JwtStrategy extracts the token from Authorization Bearer header, verifies signature and expiry, then attaches the decoded payload to req.user for downstream guards and controllers.
