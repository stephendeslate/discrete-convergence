# Frontend Specification

## Overview

Fleet Dispatch frontend is built with Next.js 15, React 19, Tailwind CSS 4,
and shadcn/ui components. It uses server actions for API communication and
stores JWT tokens in HTTP-only cookies for security.

## Pages

### Login Page (/login)
- VERIFY: FD-UI-001 — Login form with email and password fields
- VERIFY: FD-UI-002 — Login server action stores token via cookies().set()

### Register Page (/register)
- VERIFY: FD-UI-003 — Registration form with email, password, role selection

### Dashboard Page (/dashboard)
- VERIFY: FD-UI-004 — Dashboard displays summary of vehicles, drivers, dispatches

### Vehicles Page (/vehicles)
- VERIFY: FD-UI-005 — Vehicle list with create/edit functionality

### Drivers Page (/drivers)
- VERIFY: FD-UI-006 — Driver list with create/edit functionality

### Dispatches Page (/dispatches)
- VERIFY: FD-UI-007 — Dispatch list with create/edit functionality

### Settings Page (/settings)
- VERIFY: FD-UI-008 — User settings and profile management

## Server Actions

All server actions follow the token storage and auth header pattern
described in [Authentication Specification](authentication.md).

- VERIFY: FD-UI-009 — Protected server actions read token via cookies().get()
- VERIFY: FD-UI-010 — Protected server actions pass Authorization: Bearer header
- VERIFY: FD-UI-011 — Server actions check response.ok before processing

## Loading States

- VERIFY: FD-UI-012 — All loading.tsx files have role="status" and aria-busy="true"

## Error States

- VERIFY: FD-UI-013 — All error.tsx files have role="alert" with useRef + focus management

## Component Library

- VERIFY: FD-UI-014 — 8+ shadcn/ui components in components/ui/

### Required Components
1. Button
2. Card
3. Input
4. Label
5. Table
6. Badge
7. Select
8. Dialog
9. Skeleton

## Dark Mode

- VERIFY: FD-UI-015 — Dark mode via @media (prefers-color-scheme: dark) in globals.css

## Accessibility

- cn() utility using clsx + tailwind-merge
- jest-axe tests for component accessibility
- Keyboard navigation tests with userEvent

## Code Splitting

- next/dynamic for heavy components with Skeleton loading states

## Route Constants

Frontend route strings must match API controller prefixes:
- /vehicles matches @Controller('vehicles')
- /drivers matches @Controller('drivers')
- /dispatches matches @Controller('dispatches')
