# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x     | Yes       |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. Do NOT open a public issue
2. Email security concerns to the project maintainers
3. Include a description of the vulnerability and steps to reproduce
4. Allow reasonable time for a fix before public disclosure

## Security Measures

- JWT authentication with 15-minute token expiry
- bcrypt password hashing with 12 salt rounds
- Role-based access control (ADMIN, ORGANIZER, VIEWER)
- Input validation via class-validator with whitelist mode
- Rate limiting via @nestjs/throttler (100 req/60s)
- Helmet security headers
- Tenant isolation at service layer
- Sensitive field redaction in logs
- No raw SQL queries (Prisma ORM only)
- CORS enabled with configurable origins
