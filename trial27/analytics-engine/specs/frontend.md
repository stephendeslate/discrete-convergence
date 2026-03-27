# Frontend Specification

## Overview

The Analytics Engine web application is built with Next.js 15 App Router, React 19,
Tailwind CSS 4, and shadcn/ui components. It provides an admin portal for managing
dashboards, widgets, data sources, and tenant settings.

## Pages

### VERIFY: AE-FE-001 — Login page
The login page at /login provides email/password authentication with form validation.
On success, the JWT token is stored and the user is redirected to /dashboard.

### VERIFY: AE-FE-002 — Registration page
The registration page at /register provides new account creation with tenant setup.
Validates email format, password length, and required fields.

### VERIFY: AE-FE-003 — Dashboard overview page
The dashboard page at /dashboard displays a summary of the user's dashboards,
data sources, and recent activity.

### VERIFY: AE-FE-004 — Dashboard management pages
The /dashboards page lists all dashboards with create, edit, publish, and delete actions.
Supports pagination and status filtering.

### VERIFY: AE-FE-005 — Widget management pages
The /widgets page allows viewing and configuring widgets across dashboards.
Widgets can be created, updated, and deleted.

### VERIFY: AE-FE-006 — Data source management pages
The /data-sources page lists data sources with create, test, and sync actions.
Configuration is handled through a form wizard.

### VERIFY: AE-FE-007 — Sync history page
The /sync-runs page shows synchronization history with status, row counts, and timing.

### VERIFY: AE-FE-008 — Settings page
The /settings page allows tenant configuration including name and tier display.

### VERIFY: AE-FE-009 — API key management
The /api-keys page allows managing API keys for embed access.

### VERIFY: AE-FE-010 — Audit log page
The /audit page displays an audit trail of all tenant actions.

## Server Actions

All data mutations use Next.js server actions with 'use server' directive.
Actions include auth headers from stored JWT tokens.

### Write Actions
- POST /auth/login via loginAction
- POST /auth/register via registerAction
- POST /dashboards via createDashboardAction
- PATCH /dashboards/:id/publish via publishDashboardAction
- DELETE /dashboards/:id via deleteDashboardAction
- POST /data-sources via createDataSourceAction
- POST /data-sources/:id/sync via syncDataSourceAction

## Components

The application uses 8+ shadcn/ui components including:
Button, Card, Input, Label, Table, Badge, Dialog, Select, Skeleton, Toast

## Styling

- Tailwind CSS 4 with dark mode support via `dark:` class prefix
- cn() utility using clsx + tailwind-merge for conditional classes
- Responsive layout with mobile-first breakpoints

## Cross-References

- API contracts: See [api-endpoints.md](api-endpoints.md)
- Authentication flow: See [authentication.md](authentication.md)
- Error handling: See [edge-cases.md](edge-cases.md)
