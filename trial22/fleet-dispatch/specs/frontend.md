# Frontend Specification

## Overview

Fleet Dispatch frontend uses Next.js 15 with App Router, React 19,
Tailwind CSS, and server actions for API communication.

## Application Structure

### Layout (app/layout.tsx)
- Sets html lang="en" for accessibility
- Navigation bar with links to all major sections
- Main content area wraps children

<!-- VERIFY: FD-FE-001 — Root layout has html lang="en" attribute -->

### Pages
- / — Home page with overview cards
- /dashboard — Fleet operations dashboard
- /vehicles — Vehicle list and management
- /drivers — Driver list and management
- /routes — Route management
- /trips — Trip scheduling
- /dispatches — Dispatch tracking
- /login — Authentication form
- /register — Registration form
- /settings — User and tenant settings

### Loading States (loading.tsx)
- dashboard, vehicles, and drivers routes have loading.tsx
- All use role="status" and aria-label for accessibility
- Skeleton animations via Tailwind animate-pulse

<!-- VERIFY: FD-FE-002 — At least 3 routes have loading.tsx with role="status" -->

### Error Boundaries (error.tsx)
- dashboard, vehicles, and drivers routes have error.tsx
- All are 'use client' components with role="alert"
- useRef focuses heading on mount for screen reader announcement
- Reset button allows retry

<!-- VERIFY: FD-FE-003 — At least 3 routes have error.tsx with role="alert" and useRef focus -->

## Server Actions (lib/actions.ts)

- login() — POST /auth/login, stores access_token in httpOnly cookie
- register() — POST /auth/register
- fetchVehicles(), fetchDrivers(), fetchRoutes(), fetchTrips(), fetchDispatches()
- logout() — Deletes access_token cookie

<!-- VERIFY: FD-FE-004 — Server actions use cookie-based token storage -->

## UI Components (8)

Button, Card, Input, Label, Badge, Table, Dialog, Skeleton
All use cn() utility from lib/utils.ts (clsx + tailwind-merge).

<!-- VERIFY: FD-FE-005 — At least 8 UI components in components/ui/ -->

## Dark Mode

CSS custom properties switch based on prefers-color-scheme media query.
Components use dark: prefix for Tailwind dark mode variants.
