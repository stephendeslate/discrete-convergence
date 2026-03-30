# Frontend Specification

## Overview

The Event Management frontend is a Next.js 15 application using React 19 with
Tailwind CSS 4 and shadcn/ui components. It follows server-first patterns with
Server Actions for data mutations.

See also: [authentication.md](authentication.md) for auth flow integration.
See also: [api-endpoints.md](api-endpoints.md) for backend API contract.

## Error Reporting

- VERIFY: EM-FE-001 — MonitoringController accepts POST /errors for frontend error
  boundary reports, publicly accessible

## Utility Function

- VERIFY: EM-FE-002 — cn() utility uses clsx + tailwind-merge for className composition

## Server Actions

- VERIFY: EM-FE-003 — Server Actions in lib/actions.ts use 'use server' directive,
  check response.ok before redirect, import validateEnvVars and APP_VERSION from shared

## Root Layout

- VERIFY: EM-FE-004 — Root layout.tsx includes Nav component, html lang="en",
  globals.css import

## Home Page

- VERIFY: EM-FE-005 — Home page uses next/dynamic for HeroSection with Skeleton
  loading state for code splitting

## Navigation

- VERIFY: EM-FE-006 — Nav component provides role="navigation", aria-label, and
  links to all major routes (events, venues, dashboard, login)

## Error Boundary

- VERIFY: EM-FE-007 — ErrorBoundary component uses role="alert", useRef<HTMLDivElement>,
  useEffect focus management with tabIndex={-1}, and reports errors to POST /errors

## Dashboard

- VERIFY: EM-FE-008 — Dashboard page displays Card components with event count,
  ticket count, and revenue metrics

## Login Page

- VERIFY: EM-FE-009 — Login page uses Input, Button, Label, Card components with
  form action pointing to login Server Action

## Routes

All routes include:
- `loading.tsx` with `role="status"` and `aria-busy="true"` on outer container
- `error.tsx` with `role="alert"` and ErrorBoundary with useRef + focus management

### Route Structure
- `/` — Home page with hero section
- `/dashboard` — Dashboard with metrics cards
- `/events` — Event listing with cards and badges
- `/venues` — Venue listing
- `/tickets` — User ticket listing
- `/login` — Login form
- `/register` — Registration form
- `/settings` — User settings

## Accessibility

- VERIFY: EM-AX-001 — jest-axe accessibility tests for Button, Input, Label, Badge,
  Card, Nav components verifying zero violations
- VERIFY: EM-AX-002 — Keyboard navigation tests using userEvent for Tab, Enter,
  Space interactions on Button and Input components

## Dark Mode

Dark mode is implemented via `@media (prefers-color-scheme: dark)` in globals.css,
using CSS custom properties for all color values. No `.dark` class toggling.

## Component Library

8+ shadcn/ui components in components/ui/:
- Button (variants: default, destructive, outline, secondary, ghost, link)
- Card (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter)
- Input
- Label
- Badge (variants: default, secondary, destructive, outline)
- Skeleton
- Separator
- Dialog
