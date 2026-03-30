# Frontend Specification

## Overview

The Analytics Engine frontend is built with Next.js 15 App Router, using shadcn/ui components with Tailwind CSS. It provides an admin portal for managing dashboards, data sources, and widgets.

## Technology Stack

- Next.js 15 with App Router
- React 19
- Tailwind CSS 4
- shadcn/ui component library (8+ components)
- clsx + tailwind-merge for className utility (cn function)

## Page Structure

### Authentication Pages
- `/login` — Login form with email/password
- `/register` — Registration form with tenant creation

### Dashboard Pages
- `/dashboard` — Main dashboard overview
- `/dashboards` — Dashboard list with create functionality
- `/widgets` — Widget management for selected dashboard
- `/data-sources` — Data source list and configuration

### Domain Route Pages (UI C8)
- `/api-keys` — API key management
- `/audit` — Audit log viewer
- `/sync-runs` — Sync history viewer

### Settings
- `/settings` — Tenant settings and configuration

## Server Actions (See specs/api-endpoints.md)

Server actions in `lib/actions.ts` with `'use server'` directive:
- `loginAction` — POST /auth/login
- `registerAction` — POST /auth/register
- `getDashboards` — GET /dashboards
- `createDashboard` — POST /dashboards
- `getDataSources` — GET /data-sources
- `createDataSource` — POST /data-sources
- `deleteDashboard` — DELETE /dashboards/:id
- `publishDashboard` — PATCH /dashboards/:id/publish
- `syncDataSource` — POST /data-sources/:id/sync

## Components

Minimum 8 components in `apps/web/components/`:
1. Button, Card, Input, Label, Badge (shadcn/ui)
2. LoadingSpinner — with role="status" and aria-busy
3. ErrorMessage — with role="alert"
4. DashboardCard, DataSourceCard, WidgetCard
5. Nav — Main navigation

## Accessibility (See specs/frontend.md AX requirements)
- `<html lang="en">` on root layout
- `<title>` via metadata
- Proper heading hierarchy (h1 → h2 → h3)
- `role="status"` on loading indicators
- `role="alert"` on error messages

## Form Validation
- Login: email + password required
- Register: email + password + name + tenant name
- Dashboard create: name required
- Data source create: name + type + connection config
- Uses FormData + validation patterns

## Verification

<!-- VERIFY: AE-FE-001 — Login form submits credentials to API -->
<!-- VERIFY: AE-FE-002 — Registration form creates user and redirects -->
<!-- VERIFY: AE-FE-003 — Dashboard list displays with pagination -->
<!-- VERIFY: AE-FE-004 — Server actions include auth token in requests -->
