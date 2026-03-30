# Frontend Specification

## Overview

The Analytics Engine frontend is built with Next.js 15 using the App Router.
It communicates with the NestJS API via server actions that handle
authentication tokens in httpOnly cookies.

## Technology Stack

- Next.js 15 with App Router
- React 19
- TypeScript 5.7+
- @repo/shared workspace dependency for constants

## Layout

The root layout (app/layout.tsx) sets:
- html lang="en" for accessibility
- Metadata with title "Analytics Engine"

VERIFY: AE-FE-001 — Root layout includes lang attribute and metadata title

## Pages

### Home (/)
Landing page with navigation links to login, register, dashboard,
data sources, and settings.

VERIFY: AE-FE-002 — Home page includes aria-labeled navigation

### Login (/login)
Client component with email/password form. Uses server action
loginAction which stores tokens in httpOnly cookies.

VERIFY: AE-FE-005 — Login form with accessible labels and aria-required

### Register (/register)
Client component with name/email/password form. Uses server action
registerAction.

### Dashboard (/dashboard)
Server component that fetches dashboards via server action getDashboards.

VERIFY: AE-FE-004 — Dashboard page uses server-side data fetching

### Data Sources (/data-sources)
Server component that fetches data sources via server action.

### Settings (/settings)
Form for profile settings with labeled inputs.

## Loading States

Three route directories include loading.tsx with role="status":
- /dashboard/loading.tsx
- /data-sources/loading.tsx
- /settings/loading.tsx

## Error Boundaries

Three route directories include error.tsx with:
- role="alert" on container
- useRef + focus() for keyboard accessibility
- tabIndex={-1} on focused heading
- Reset button to retry

VERIFY: AE-FE-003 — Error boundaries use useRef and focus for accessibility

## Components

8 reusable UI components:
1. Button — Variants: default, destructive, outline, ghost
2. Card — With CardHeader, CardContent sub-components
3. Input — With label, error state, aria-invalid, aria-describedby
4. Badge — Variants: default, success, warning, error
5. Table — With TableHeader, TableBody, TableRow, TableHead, TableCell
6. Dialog — Modal with showModal/close, aria-labelledby
7. Select — With label, options, error state
8. Skeleton — Loading placeholder with aria-hidden

VERIFY: AE-FE-007 — Reusable UI component library with accessibility attributes

## Server Actions

All API calls go through server actions in lib/actions.ts:
- loginAction — POST /auth/login, stores tokens in cookies
- registerAction — POST /auth/register
- getDashboards — GET /dashboards with auth headers
- getDataSources — GET /data-sources with auth headers
- createDashboard — POST /dashboards
- deleteDashboard — DELETE /dashboards/:id

VERIFY: AE-FE-006 — Server actions attach Authorization Bearer header from cookies
