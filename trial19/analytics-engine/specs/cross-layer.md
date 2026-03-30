# Cross-Layer Integration Specification

## Overview

End-to-end verification of shared package consumption, authentication pipeline, and full request lifecycle.

## Requirements

### AE-CROSS-001: Shared Constants Consumption
- **VERIFY**: API consumes APP_VERSION, BCRYPT_SALT_ROUNDS, ALLOWED_REGISTRATION_ROLES from shared
- Constants used at runtime, not just imported

### AE-CROSS-002: App Module Wiring
- **VERIFY**: AppModule registers ThrottlerGuard, JwtAuthGuard, RolesGuard as APP_GUARD in order
- GlobalExceptionFilter as APP_FILTER, ResponseTimeInterceptor as APP_INTERCEPTOR

### AE-CROSS-003: Full Auth Pipeline
- **VERIFY**: Complete flow: register -> login -> authenticated CRUD -> error handling with correlation ID
- Frontend authenticatedFetch passes Bearer token from cookie

### AE-CROSS-004: Shared Barrel Exports
- **VERIFY**: Shared index.ts exports 8+ utilities consumed by both API and web packages
- Barrel re-exports all types, constants, validators, and utilities
