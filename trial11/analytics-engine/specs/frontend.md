# Frontend Specification

## Overview

The Analytics Engine frontend is a Next.js 15 application with React 19, Tailwind CSS 4,
and shadcn/ui components. It uses server actions for API communication and cookies for
auth token storage.

See also: [Authentication](authentication.md) for login/register flows.
See also: [API Endpoints](api-endpoints.md) for backend route definitions.

## UI Library

VERIFY: AE-UI-001
cn() utility combines clsx and tailwind-merge for conditional class composition.

VERIFY: AE-UI-002
Root layout includes Nav component and applies global styles.

VERIFY: AE-UI-003
Nav component provides navigation links with semantic HTML (role="navigation").

VERIFY: AE-UI-004
Button component supports default, outline, ghost, destructive variants and sm/lg sizes.

VERIFY: AE-UI-005
Login page uses Card, Input, Label, Button components with form action.

VERIFY: AE-UI-006
Dashboard page displays paginated dashboard list with Table and Badge components.

## Component Library (shadcn/ui)

The following components are implemented in components/ui/:
1. Button — primary action component with variants
2. Card — container with header, title, description, content, footer
3. Input — text input with styling and focus states
4. Label — form label with peer styling
5. Badge — status indicator with color variants
6. Skeleton — loading placeholder with pulse animation
7. Table — data table with header, body, row, head, cell
8. Alert — notification component with role="alert"
9. Select — dropdown select with styling

## Functional Integration

VERIFY: AE-FI-001
Login server action stores JWT token via cookies().set() after successful auth.

VERIFY: AE-FI-002
Register server action posts to /auth/register and redirects to /login.

VERIFY: AE-FI-003
getDashboards server action reads auth cookie and fetches from /dashboards.

VERIFY: AE-FI-004
getDataSources server action fetches from /data-sources with auth headers.

VERIFY: AE-FI-005
getWidgets server action fetches from /widgets with auth headers.

## Route Structure

- / — Home page with CTA buttons
- /login — Login form with email/password
- /register — Registration form
- /dashboard — Dashboard list (protected)
- /data-sources — Data source list (protected)
- /settings — Application info page

## Loading and Error States

All routes include loading.tsx with role="status" and aria-busy="true".
All routes include error.tsx with role="alert", useRef, and focus management.

## Dark Mode

Dark mode uses @media (prefers-color-scheme: dark) in globals.css with CSS variables.
