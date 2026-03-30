# Frontend Specification

## Overview

The Analytics Engine frontend is built with Next.js 15 App Router and shadcn/ui components. It provides dashboard management, data source configuration, authentication, and settings pages with full accessibility support.

See also: [api-endpoints.md](api-endpoints.md) for backend routes, [monitoring.md](monitoring.md) for error reporting.

## Layout and Navigation

VERIFY: AE-FE-001 — Root layout includes Nav component with links to all routes and metadata

### Root Layout
- Includes global CSS with dark mode via @media (prefers-color-scheme: dark)
- Nav component in header with links to dashboards, data sources, settings, login
- Metadata for SEO (title, description)

## Route Pages

VERIFY: AE-FE-002 — Dashboard page fetches via getDashboards server action with auth token

VERIFY: AE-FE-003 — Error boundaries use role="alert", useRef, useEffect focus management, tabIndex={-1}

VERIFY: AE-FE-004 — Data sources page fetches via getDataSources server action with auth token

### Dashboard (/dashboard)
- Displays grid of dashboard cards with title, status badge
- Loading state with Skeleton components (role="status", aria-busy="true")
- Error boundary with focus management

### Data Sources (/data-sources)
- Displays grid of data source cards with name, type badge
- Loading and error states follow same accessibility patterns

### Login (/login)
- Form with email and password inputs using Label components
- Submit triggers loginAction server action

### Register (/register)
- Form with email, password, tenantId inputs
- Submit triggers registerAction server action

### Settings (/settings)
- Account profile and notification preferences

## Server Actions

VERIFY: AE-FE-005 — Login server action stores token via cookies().set after successful auth

VERIFY: AE-FE-006 — cn() utility uses clsx + tailwind-merge for class composition

VERIFY: AE-FE-007 — Server actions send Authorization Bearer headers from cookie token

VERIFY: AE-FE-008 — Nav component provides navigation to all application routes

## Component Library

8+ shadcn/ui components: Button, Card, Input, Label, Badge, Skeleton, Separator, Tabs, Dialog

## Accessibility

- All loading states: role="status" + aria-busy="true"
- All error states: role="alert" + useRef + focus management + tabIndex={-1}
- Form inputs have associated Label components
- Keyboard navigation tested with userEvent
- jest-axe integration tests for WCAG compliance
