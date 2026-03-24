# Frontend Specification

## Overview

Next.js 15 App Router application with shadcn/ui components, Tailwind CSS,
server actions for API communication, and comprehensive accessibility support.

## Root Layout

- VERIFY:AE-FE-005 — Root layout with Nav component, semantic HTML structure
- html lang="en" for accessibility
- main element wraps children with container styling
- Nav component provides consistent navigation

## Pages

| Route | Component | Description |
|-------|-----------|-------------|
| / | page.tsx | Home with APP_VERSION display |
| /login | page.tsx | Login form with server action |
| /register | page.tsx | Registration form |
| /dashboards | page.tsx | Dashboard list with dynamic import |
| /data-sources | page.tsx | Data source management |
| /embed-settings | page.tsx | Embed configuration |
| /api-keys | page.tsx | API key management |
| /settings | page.tsx | Application settings |

## Server Actions

- VERIFY:AE-FE-003 — All server actions use 'use server' directive
- Response validation: check response.ok before redirect
- No direct fetch from client components — actions proxy API calls
- VERIFY:AE-SHARED-001 — APP_VERSION imported from shared package

## Dark Mode

- VERIFY:AE-FE-004 — Dark mode via @media (prefers-color-scheme: dark), NOT .dark class
- CSS variables switch between light and dark values
- No JavaScript toggle — follows system preference
- All color values defined as CSS custom properties in globals.css

## Loading States

- VERIFY:AE-FE-006 — Loading states use role="status" and aria-busy="true"
- Skeleton components from shadcn/ui for placeholder content
- Each route has its own loading.tsx for granular loading states
- Screen readers announce loading state via role="status"

## Error States

- VERIFY:AE-FE-007 — Error boundaries use role="alert", useRef<HTMLDivElement>,
  useEffect for focus management, tabIndex={-1}
- Error heading and message displayed within alert region
- Focus automatically moves to error container for screen reader announcement
- Retry button and home navigation provided

## Code Splitting

- VERIFY:AE-FE-008 — next/dynamic for code splitting with Skeleton fallback
- Dashboard list component loaded dynamically to reduce initial bundle
- Skeleton loading state shown during chunk loading

## UI Components (11 shadcn/ui components)

- VERIFY:AE-FE-002 — cn() utility using clsx + tailwind-merge for class merging

| Component | File | Usage |
|-----------|------|-------|
| Button | components/ui/button.tsx | Actions, form submit |
| Card | components/ui/card.tsx | Content containers |
| Input | components/ui/input.tsx | Form fields |
| Label | components/ui/label.tsx | Input labels |
| Badge | components/ui/badge.tsx | Status indicators |
| Skeleton | components/ui/skeleton.tsx | Loading placeholders |
| Table | components/ui/table.tsx | Data display |
| Switch | components/ui/switch.tsx | Toggle settings |
| Dialog | components/ui/dialog.tsx | Modal confirmations |
| Nav | components/ui/nav.tsx | Navigation bar |
| DashboardList | components/ui/dashboard-list.tsx | Dashboard cards |

## Accessibility

- VERIFY:AE-TEST-010 — jest-axe tests on real Button, Card, Input+Label, Badge, Switch
- VERIFY:AE-TEST-011 — Keyboard navigation tests with userEvent: Tab, Shift+Tab, Enter, Space
- All interactive elements focusable via keyboard
- Labels associated with inputs via htmlFor/id
- ARIA roles on loading (status) and error (alert) states
- No autofocus on mount — focus managed only on error state

## Cross-References

- See [monitoring.md](monitoring.md) for frontend error POST endpoint (AE-FE-001)
- See [authentication.md](authentication.md) for login/register flows
- See [api-endpoints.md](api-endpoints.md) for API routes called by server actions
- See [security.md](security.md) for CSP frame-ancestors configuration
