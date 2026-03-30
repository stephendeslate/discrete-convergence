# Frontend Specification

## Overview

The Analytics Engine frontend is a Next.js 15 App Router application with shadcn/ui
components, Tailwind CSS 4 styling, and comprehensive accessibility support.
It provides an admin portal for managing dashboards, data sources, and settings.

## Routes

| Route | Purpose |
|-------|---------|
| / | Home page with feature overview |
| /dashboard | Dashboard list and management |
| /data-sources | Data source configuration |
| /login | User authentication |
| /register | New user registration |
| /settings | Organization settings |

## Requirements

<!-- VERIFY:AE-UI-001 — Dark mode via @media (prefers-color-scheme: dark) in globals.css -->
- REQ-UI-001: Dark mode must use `@media (prefers-color-scheme: dark)` in globals.css
- NOT the `.dark` class approach

<!-- VERIFY:AE-UI-002 — cn() utility uses clsx + tailwind-merge -->
- REQ-UI-002: The `cn()` utility in lib/utils.ts must use both clsx and tailwind-merge

<!-- VERIFY:AE-UI-003 — Server Actions check response.ok before processing -->
- REQ-UI-003: All server actions in lib/actions.ts must check `response.ok`
- Actions must use 'use server' directive

<!-- VERIFY:AE-UI-004 — Nav component is included in root layout.tsx -->
- REQ-UI-004: Root layout must include a Nav component for site navigation

## Accessibility Requirements

<!-- VERIFY:AE-AX-001 — All loading.tsx files have role="status" + aria-busy="true" -->
- REQ-AX-001: Every loading.tsx must include `role="status"` and `aria-busy="true"`
- Loading states must include sr-only text for screen readers

<!-- VERIFY:AE-AX-002 — All error.tsx files have role="alert" + useRef + useEffect focus + tabIndex={-1} -->
- REQ-AX-002: Every error.tsx must include:
  - `role="alert"` on the container
  - `useRef<HTMLDivElement>` for focus management
  - `useEffect` to focus the container on mount
  - `tabIndex={-1}` for programmatic focus

<!-- VERIFY:AE-AX-003 — Accessibility tests use real jest-axe imports with real components -->
- REQ-AX-003: Accessibility tests must use jest-axe with real component rendering
- No mock implementations of axe

<!-- VERIFY:AE-AX-004 — Keyboard navigation tests use userEvent tab/enter/space -->
- REQ-AX-004: Keyboard tests must verify tab order, Enter activation, and Space activation

## Component Library

The application uses 8+ shadcn/ui components in `components/ui/`:

1. Button — with variants (default, destructive, outline, secondary, ghost, link)
2. Card — with CardHeader, CardTitle, CardDescription, CardContent, CardFooter
3. Input — styled form input
4. Label — accessible form labels via Radix
5. Separator — horizontal/vertical dividers
6. Switch — toggle control
7. Tabs — tabbed content areas
8. Skeleton — loading placeholder
9. Badge — status/category indicators

## Server Actions

Server actions in `lib/actions.ts`:
- loginAction: POST /auth/login
- registerAction: POST /auth/register
- fetchDashboards: GET /dashboards
- fetchDataSources: GET /data-sources
- getAppVersion: returns APP_VERSION from shared
- checkEnv: validates frontend env vars using validateEnvVars from shared

## Dark Mode

Dark mode is implemented via CSS custom properties and `@media (prefers-color-scheme: dark)`.
This approach respects the user's OS-level preference without requiring JavaScript.
