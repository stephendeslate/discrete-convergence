# Security Specification

## Overview
Defense-in-depth security with Helmet CSP, CORS, input validation, and global guard chain.

## Requirements

### FD-SEC-001: Helmet CSP
<!-- VERIFY: FD-SEC-001 -->
Helmet middleware configured with Content-Security-Policy: script-src 'self', default-src 'self'. Prevents XSS via inline script injection.

### FD-SEC-002: Global Guard Chain
<!-- VERIFY: FD-SEC-002 -->
Three global guards applied via APP_GUARD: ThrottlerGuard (rate limiting), JwtAuthGuard (authentication), RolesGuard (authorization). Order ensures rate limiting is checked first.

### FD-SEC-003: CORS Configuration
<!-- VERIFY: FD-SEC-003 -->
CORS enabled with origin from CORS_ORIGIN env var (default http://localhost:3000) and credentials: true for cookie support.

### FD-SEC-004: Input Validation
<!-- VERIFY: FD-SEC-004 -->
Global ValidationPipe with whitelist: true and forbidNonWhitelisted: true strips unknown fields and rejects requests with unexpected properties.

### FD-SEC-005: No Console.log
<!-- VERIFY: FD-SEC-005 -->
No console.log in production code. Pino logger conditionally configured with pino-pretty transport ONLY when NODE_ENV === 'development'.
