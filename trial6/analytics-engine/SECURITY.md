# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x     | Yes       |

## Reporting a Vulnerability

Report security vulnerabilities by emailing the maintainers directly. Do not open public issues for security concerns.

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact assessment
- Suggested fix (if available)

We aim to acknowledge reports within 48 hours and provide a resolution timeline within 5 business days.

## Ignored CVEs

No CVEs are currently ignored. The `pnpm.auditConfig.ignoreCves` array in `package.json` is empty.

If a CVE must be ignored in the future, document it here with:
- CVE identifier
- Affected package and version
- Reason for ignoring (e.g., not reachable in our usage, awaiting upstream fix)
- Date added and planned review date

## Security Architecture

### Authentication
- JWT-based authentication with access and refresh tokens
- Passwords hashed with bcrypt (12 salt rounds)
- Tokens contain userId, email, role, and tenantId claims
- Public endpoints explicitly marked with `@Public()` decorator

### Authorization
- Role-Based Access Control (RBAC) with ADMIN, USER, VIEWER roles
- `RolesGuard` enforces role requirements on protected endpoints
- Tenant isolation enforced at the service layer (every query scoped by tenantId)

### API Security
- Helmet middleware for HTTP security headers
- Global rate limiting via ThrottlerGuard
- Correlation ID middleware for request tracing
- Global exception filter sanitizes error responses (no stack traces in production)
- Input validation via class-validator on all DTOs

### Data Security
- No `$executeRaw` usage (prevents SQL injection surface)
- `findFirst` calls require justification comments
- Structured logging via Pino (no `console.log`)
- Sensitive fields excluded from log output by the global exception filter

### Infrastructure
- Multi-stage Docker build with non-root runtime user (`appuser`)
- Health check endpoints are public but expose minimal information
- Environment variables validated at startup (`validateEnvVars`)
