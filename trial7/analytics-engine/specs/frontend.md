# Frontend Specification

## Overview

The Analytics Engine frontend is a Next.js 15 application with React 19,
Tailwind CSS, and shadcn/ui components. It provides authentication pages,
dashboard views, data source management, and settings.
See [api-endpoints.md](api-endpoints.md) for backend integration details.

## Component Library

8+ shadcn/ui components in components/ui/:
- Button (variants: default, destructive, outline, ghost; sizes: default, sm, lg)
- Card (Card, CardHeader, CardTitle, CardContent, CardFooter)
- Input
- Label
- Skeleton (for loading states)
- Badge (variants: default, secondary, destructive, outline)
- Table (Table, TableHeader, TableBody, TableRow, TableHead, TableCell)
- Dialog (Dialog, DialogTitle, DialogContent)

- VERIFY: AE-UI-001 — cn() utility uses clsx + tailwind-merge for className merging
- VERIFY: AE-UI-002 — Server Actions check response.ok before redirect
- VERIFY: AE-UI-003 — Auth helpers (getToken, getSession) manage JWT from cookies
- VERIFY: AE-UI-004 — Root layout includes Nav component and metadata
- VERIFY: AE-UI-005 — Nav component provides main navigation with semantic HTML

## Routes

### / — Home page with sign in and register links
### /login — Login form with server action
### /register — Registration form with server action
### /dashboard — Dashboard list with dynamic import
### /data-sources — Data source table with dynamic import
### /settings — Account settings page

## Loading States

All routes have a loading.tsx file with:
- role="status" attribute on outer container
- aria-busy="true" attribute on outer container
- Skeleton components for visual placeholder

- VERIFY: AE-FE-001 — Dashboard page uses next/dynamic with Skeleton loading
- VERIFY: AE-FE-002 — Dashboard loading state has role="status" and aria-busy="true"

## Error States

All routes have an error.tsx file with:
- 'use client' directive
- role="alert" attribute on outer container
- useRef<HTMLDivElement> for focus management
- useEffect to focus the error container on mount
- tabIndex={-1} for programmatic focus
- Reset button to retry

- VERIFY: AE-FE-003 — Dashboard error uses role="alert", useRef, and focus management
- VERIFY: AE-FE-004 — Login page provides form with server action integration
- VERIFY: AE-FE-005 — DashboardList component renders dashboard cards
- VERIFY: AE-FE-006 — ErrorBoundaryFallback posts errors to /errors endpoint

## Dark Mode

Implemented via @media (prefers-color-scheme: dark) in globals.css.
CSS custom properties switch between light and dark values automatically.
No .dark class toggling.

## Code Splitting

Dynamic imports via next/dynamic for heavy components:
- DashboardList — loaded with Skeleton fallback
- DataSourceList — loaded with Skeleton fallback

## Server Actions

All server actions use 'use server' directive and:
1. Send request to API
2. Check response.ok before proceeding
3. Throw Error on failure
4. redirect() on success
