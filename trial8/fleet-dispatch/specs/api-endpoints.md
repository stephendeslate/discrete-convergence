# API Endpoints Specification

## Overview
RESTful API with NestJS controllers. All endpoints require JWT auth except
those marked with @Public(). Rate limiting applied globally.

## Auth Endpoints
- POST /auth/login - Public, rate limited (auth: 5/min)
- POST /auth/register - Public, rate limited (auth: 5/min)

## Vehicle Endpoints (Controller: 'vehicles')
- GET /vehicles - List vehicles (paginated, Cache-Control)
- GET /vehicles/:id - Get single vehicle
- POST /vehicles - Create vehicle (ADMIN, DISPATCHER)
- PUT /vehicles/:id - Update vehicle (ADMIN, DISPATCHER)
- DELETE /vehicles/:id - Delete vehicle (ADMIN only)
- VERIFY: FD-VEH-001 - List vehicles with auth
- VERIFY: FD-VEH-002 - Reject creation with invalid VIN
- VERIFY: FD-VEH-003 - Reject creation with extra fields
- VERIFY: FD-VEH-004 - Reject without auth
- VERIFY: FD-VEH-005 - Reject delete with wrong role
- VERIFY: FD-VEH-006 - Reject creation with missing fields
- VERIFY: FD-VEH-015 - Frontend fetches from /vehicles

## Driver Endpoints (Controller: 'drivers')
- GET /drivers - List drivers (paginated, Cache-Control)
- GET /drivers/:id - Get single driver
- POST /drivers - Create driver (ADMIN, DISPATCHER)
- PUT /drivers/:id - Update driver (ADMIN, DISPATCHER)
- DELETE /drivers/:id - Delete driver (ADMIN only)
- VERIFY: FD-DRV-008 - Frontend fetches from /drivers

## Route Endpoints (Controller: 'routes')
- GET /routes - List routes (paginated, Cache-Control)
- GET /routes/:id - Get single route
- POST /routes - Create route (ADMIN, DISPATCHER)
- PUT /routes/:id - Update route (ADMIN, DISPATCHER)
- DELETE /routes/:id - Delete route (ADMIN only)

## Trip Endpoints (Controller: 'trips')
- GET /trips - List trips (paginated, Cache-Control)
- GET /trips/:id - Get single trip
- POST /trips - Create trip (ADMIN, DISPATCHER)
- PUT /trips/:id - Update trip (ADMIN, DISPATCHER)
- DELETE /trips/:id - Delete trip (ADMIN only)

## Maintenance Endpoints (Controller: 'maintenance')
- GET /maintenance - List records (paginated, Cache-Control)
- GET /maintenance/:id - Get single record
- POST /maintenance - Create record (ADMIN, DISPATCHER)
- PUT /maintenance/:id - Update record (ADMIN, DISPATCHER)
- DELETE /maintenance/:id - Delete record (ADMIN only)

## Health/Monitoring Endpoints
- GET /health - Public, SkipThrottle
- GET /health/ready - Public, SkipThrottle
- GET /metrics - Public, SkipThrottle
- POST /errors - Public (frontend error reporting)

## Validation
- All DTO string fields: @IsString() + @MaxLength()
- UUID fields: @MaxLength(36)
- Email: @IsEmail() + @IsString() + @MaxLength()
- Pagination clamped (not rejected) via clampPagination

## Cross-References
- See [authentication.md](authentication.md) for auth flow
- See [data-model.md](data-model.md) for entity schemas
