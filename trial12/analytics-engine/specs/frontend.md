# Frontend Specification

## Overview

The Analytics Engine frontend is a Next.js 15 application with React 19, using
Tailwind CSS 4 for styling and shadcn/ui-style components. It provides pages for
dashboards, widgets, data sources, login, registration, and settings.

See also: [API Endpoints](api-endpoints.md) for backend routes the frontend calls.
See also: [Authentication](authentication.md) for token storage flow.

## Component Library

8+ shadcn/ui-style components in components/ui/:
- Button — variants: default, destructive, outline, ghost; sizes: default, sm, lg
- Card — bordered container with shadow
- Input — form input with focus ring
- Label — accessible form label
- Badge — status/type indicators with color variants
- Skeleton — loading placeholder with animation
- Alert — status messages with variant support
- Select — dropdown selection
- Separator — visual divider

## Route Structure

- `/` — Home page with feature overview cards
- `/dashboard` — Dashboard listing page
- `/widgets` — Widget listing page
- `/data-sources` — Data source listing page
- `/login` — Login form
- `/register` — Registration form
- `/settings` — Application settings and version info

## Requirements

- VERIFY: AE-UI-001 — cn() utility uses clsx + tailwind-merge
- VERIFY: AE-UI-002 — Navigation component with links to all main routes
- VERIFY: AE-UI-003 — Root layout includes Nav component and global styles
- VERIFY: AE-UI-004 — Dashboard page fetches and displays dashboards from API

## Loading States

Every route includes a loading.tsx with:
- `role="status"` on outer container
- `aria-busy="true"` on outer container
- Skeleton components for content placeholder

## Error States

Every route includes an error.tsx with:
- `role="alert"` on outer container
- `useRef<HTMLDivElement>` with focus management
- `tabIndex={-1}` for programmatic focus
- `useEffect` to focus error container on mount
- Reset button to retry

## Dark Mode

Dark mode is implemented via `@media (prefers-color-scheme: dark)` in globals.css.
CSS custom properties switch between light and dark color schemes automatically.
No `.dark` class-based approach is used.

## Server Actions

All server actions use `'use server'` directive and check `response.ok` before
proceeding. The login action stores the auth token in an httpOnly cookie.
Protected actions read the token from cookies and pass Authorization headers.

## Accessibility

- All forms have properly associated labels
- Interactive elements are keyboard-navigable
- Color is not the only indicator of state
- jest-axe tests verify no WCAG violations
