# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x     | Yes       |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. Do NOT open a public issue.
2. Email security@fleet-dispatch.example.com with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact assessment
3. You will receive acknowledgment within 48 hours.
4. A fix will be developed and released within 7 days for critical issues.

## Security Measures

- JWT authentication with bcrypt password hashing (12 salt rounds)
- Role-based access control (ADMIN, DISPATCHER, DRIVER)
- Multi-tenant data isolation at the service layer
- Input validation on all endpoints (class-validator + ValidationPipe)
- Rate limiting (100 requests/minute via @nestjs/throttler)
- HTTP security headers (Helmet)
- Log sanitization for sensitive fields (passwords, tokens, secrets)
- CORS restricted to configured origins
- No raw SQL execution ($executeRaw/$executeRawUnsafe prohibited)
