# Frontend Specification

## Overview

The Analytics Engine frontend is built with Next.js 15 using the App Router,
React 19, Tailwind CSS, and server actions for data mutations.

## Technology Stack

- Next.js 15 with App Router
- React 19
- Tailwind CSS 3.4
- TypeScript 5.7
- clsx + tailwind-merge for className utility (cn function)

<!-- VERIFY:FE-NEXTJS-15 — Frontend uses Next.js 15 with App Router -->
<!-- VERIFY:FE-CN-UTILITY — cn() function uses clsx + tailwind-merge -->

## Pages

| Route | Component | Description |
|-------|-----------|-------------|
| / | app/page.tsx | Landing page with navigation |
| /login | app/login/page.tsx | Login form |
| /register | app/register/page.tsx | Registration form |
| /dashboard | app/dashboard/page.tsx | Dashboard list and creation |
| /data-sources | app/data-sources/page.tsx | Data source management |
| /widgets | app/widgets/page.tsx | Widget management |
| /analytics | app/analytics/page.tsx | Analytics overview |
| /reports | app/reports/page.tsx | Reports page |
| /embed | app/embed/page.tsx | Embed configuration |
| /settings | app/settings/page.tsx | User settings |

<!-- VERIFY:FE-ROUTES — All domain routes exist as page.tsx files -->

## Components

### NavBar (components/nav-bar.tsx)
- Navigation links to all main routes
- Responsive layout with flexbox
- Dark mode support

### CreateDashboardForm (components/create-dashboard-form.tsx)
- Form with name and description fields
- Uses handleSubmit pattern with form onSubmit
- Calls createDashboard server action

### CreateDataSourceForm (components/create-data-source-form.tsx)
- Form with name, type, and connection config fields
- Uses handleSubmit pattern with form onSubmit
- Calls createDataSource server action

### CreateWidgetForm (components/create-widget-form.tsx)
- Form with name, type, and dashboard selection
- Uses handleSubmit pattern with form onSubmit
- Calls createWidget server action

<!-- VERIFY:FE-FORM-COMPONENTS — At least 2 form components with onSubmit -->

### DashboardList (components/dashboard-list.tsx)
- Displays list of dashboards with pagination
- Links to individual dashboard views

### DataSourceList (components/data-source-list.tsx)
- Displays data sources with sync status
- Actions for sync and test connection

### WidgetList (components/widget-list.tsx)
- Displays widgets grouped by dashboard
- Widget type indicators

### ErrorBoundary (components/error-boundary.tsx)
- Client-side error boundary component
- Displays fallback UI on error
- Reset functionality

### LoadingSkeleton (components/loading-skeleton.tsx)
- Animated loading placeholder
- Configurable height and width

## Server Actions (lib/actions.ts)

All server actions use the 'use server' directive:
- createDashboard: POST to /dashboards
- updateDashboard: PUT to /dashboards/:id
- deleteDashboard: DELETE to /dashboards/:id
- createDataSource: POST to /data-sources
- updateDataSource: PATCH to /data-sources/:id
- createWidget: POST to /widgets
- deleteWidget: DELETE to /widgets/:id
- syncDataSource: POST to /data-sources/:id/sync

<!-- VERIFY:FE-SERVER-ACTIONS — Server actions use 'use server' directive -->

## API Client (lib/api.ts)

- apiFetch: Base fetch wrapper with auth headers
- authApi: login, register, refresh
- dashboardApi: list, get, create, update, delete
- widgetApi: list, get, create, update, delete
- dataSourceApi: list, get, create, update, delete, sync, testConnection

## Styling

- Tailwind CSS with custom configuration
- Dark mode via class strategy
- Global styles in app/globals.css
- PostCSS with autoprefixer

## Layout

- Root layout (app/layout.tsx) with html lang="en"
- Dark mode class on html element
- NavBar included in layout
- Inter font family

## Implementation Traceability

<!-- VERIFY:AE-WEB-ACT-001 — Server actions with use server directive -->
<!-- VERIFY:AE-WEB-ACT-002 — Create dashboard server action (POST) -->
<!-- VERIFY:AE-WEB-ACT-003 — Update dashboard server action (PUT) -->
<!-- VERIFY:AE-WEB-ACT-004 — Delete dashboard server action (DELETE) -->
<!-- VERIFY:AE-WEB-ACT-005 — Create data source server action (POST) -->
<!-- VERIFY:AE-WEB-ACT-006 — Create widget server action (POST) -->
<!-- VERIFY:AE-WEB-ACT-007 — Delete widget server action (DELETE) -->
<!-- VERIFY:AE-WEB-ACT-008 — Sync data source server action (POST) -->
<!-- VERIFY:AE-WEB-ACT-009 — Update data source server action (PATCH) -->
<!-- VERIFY:AE-WEB-ACT-010 — Login action alias -->
<!-- VERIFY:AE-WEB-ACT-011 — Register action alias -->
<!-- VERIFY:AE-WEB-ACT-012 — Create dashboard action alias -->
<!-- VERIFY:AE-WEB-ACT-013 — Update dashboard action alias -->
<!-- VERIFY:AE-WEB-ACT-014 — Delete dashboard action alias -->
<!-- VERIFY:AE-WEB-ACT-015 — Create data source action alias -->
<!-- VERIFY:AE-WEB-ACT-016 — Create widget action alias -->
<!-- VERIFY:AE-WEB-API-001 — API client apiFetch wrapper -->
<!-- VERIFY:AE-WEB-API-002 — API client auth endpoints -->
<!-- VERIFY:AE-WEB-API-003 — API client CRUD endpoints -->
<!-- VERIFY:AE-WEB-EMBED-001 — Embed page component -->
<!-- VERIFY:AE-WEB-NAV-001 — NavBar component -->
<!-- VERIFY:AE-WEB-UTIL-001 — cn() utility function -->
<!-- VERIFY:WEB-ANALYTICS — Analytics page -->
<!-- VERIFY:WEB-COMP-DASHFORM — Dashboard form component -->
<!-- VERIFY:WEB-COMP-DASHLIST — Dashboard list component -->
<!-- VERIFY:WEB-COMP-DSFORM — Data source form component -->
<!-- VERIFY:WEB-COMP-DSLIST — Data source list component -->
<!-- VERIFY:WEB-COMP-ERRBOUNDARY — Error boundary component -->
<!-- VERIFY:WEB-COMP-SKELETON — Loading skeleton component -->
<!-- VERIFY:WEB-COMP-WIDGETFORM — Widget form component -->
<!-- VERIFY:WEB-COMP-WIDGETLIST — Widget list component -->
<!-- VERIFY:WEB-DASHBOARD — Dashboard page -->
<!-- VERIFY:WEB-DATASOURCES — Data sources page -->
<!-- VERIFY:WEB-HOME — Home page -->
<!-- VERIFY:WEB-LAYOUT — Root layout -->
<!-- VERIFY:WEB-LOGIN — Login page -->
<!-- VERIFY:WEB-REGISTER — Register page -->
<!-- VERIFY:WEB-REPORTS — Reports page -->
<!-- VERIFY:WEB-SETTINGS — Settings page -->
<!-- VERIFY:WEB-WIDGETS — Widgets page -->
<!-- VERIFY:TEST-WEB-ACTIONS — Web actions test suite -->
<!-- VERIFY:TEST-WEB-API — Web API client tests -->
