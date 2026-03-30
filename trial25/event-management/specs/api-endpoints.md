# API Endpoints Specification

## Overview

All API endpoints follow RESTful conventions with JSON request/response bodies.
Protected endpoints require JWT Bearer token in the Authorization header.
Authentication requirements are defined in [authentication.md](authentication.md).
Security controls including rate limiting are described in [security.md](security.md).

## Authentication Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/register | No | Register new user account |
| POST | /auth/login | No | Authenticate and get tokens |
| POST | /auth/refresh | No | Refresh access token |

## Event Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /events | Yes | List events with pagination |
| POST | /events | Yes | Create a new event |
| GET | /events/:id | Yes | Get event details |
| PUT | /events/:id | Yes | Update event |
| DELETE | /events/:id | Yes | Delete event |
| PATCH | /events/:id/publish | Yes | Publish draft event |
| PATCH | /events/:id/cancel | Yes | Cancel event |

## Venue Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /venues | Yes | List venues with pagination |
| POST | /venues | Yes | Create a new venue |
| GET | /venues/:id | Yes | Get venue details |
| PUT | /venues/:id | Yes | Update venue |
| DELETE | /venues/:id | Yes | Delete venue |

## Ticket Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /tickets | Yes | List tickets with pagination |
| POST | /tickets | Yes | Create a new ticket |
| GET | /tickets/:id | Yes | Get ticket details |
| PATCH | /tickets/:id/cancel | Yes | Cancel a ticket |
| PATCH | /tickets/:id/refund | Yes | Refund a ticket |

## Attendee Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /attendees | Yes | List attendees with pagination |
| POST | /attendees | Yes | Register an attendee |
| GET | /attendees/:id | Yes | Get attendee details |
| PATCH | /attendees/:id/check-in | Yes | Check in attendee |

## Speaker Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /speakers | Yes | List speakers with pagination |
| POST | /speakers | Yes | Create a speaker |
| GET | /speakers/:id | Yes | Get speaker details |
| PUT | /speakers/:id | Yes | Update speaker |
| DELETE | /speakers/:id | Yes | Delete speaker |

## Session Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /sessions | Yes | List sessions with pagination |
| POST | /sessions | Yes | Create a session |
| GET | /sessions/:id | Yes | Get session details |
| PUT | /sessions/:id | Yes | Update session |
| DELETE | /sessions/:id | Yes | Delete session |
| PATCH | /sessions/:id/confirm | Yes | Confirm a session |

## Sponsor Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /sponsors | Yes | List sponsors with pagination |
| POST | /sponsors | Yes | Create a sponsor |
| GET | /sponsors/:id | Yes | Get sponsor details |
| PUT | /sponsors/:id | Yes | Update sponsor |
| DELETE | /sponsors/:id | Yes | Delete sponsor |

## Monitoring Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /health | No | Basic health check |
| GET | /health/ready | No | Database readiness check |
| GET | /health/metrics | No | Application metrics |

## Pagination

All list endpoints support pagination via query parameters:
- `page` (default: 1, min: 1)
- `pageSize` (default: 20, max: 100)

Response format:
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## Error Format

All errors return consistent JSON:
```json
{
  "statusCode": 400,
  "message": "Description of error",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "path": "/endpoint",
  "correlationId": "uuid-v4"
}
```
