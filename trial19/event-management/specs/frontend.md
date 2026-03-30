# Frontend Specification

## Overview

Next.js 15 web application with App Router, server actions for API
communication, and shadcn/ui-style components. Accessibility-first design
with WCAG 2.1 AA compliance.

## Architecture

- Next.js 15 with App Router (app/ directory)
- Server actions in lib/actions.ts for API communication
- Cookie-based authentication (httpOnly, secure)
- TypeScript with strict mode

## Authentication Flow

- Login page uses useActionState for form handling
- Server action validates credentials against API
- On success, sets httpOnly cookie with JWT token
- On failure, returns error message (no throw)
- VERIFY: EM-FI-001 — loginAction sets httpOnly cookie and redirects to dashboard

## Route Structure

- / — Home page with h1 heading
- /login — Login form with email/password
- /register — Registration form with email/password/name
- /dashboard — Dashboard page (auth required)
- /events — Events list (auth required)
- /venues — Venues list (auth required)
- /attendees — Attendees list (auth required)
- /registrations — Registrations list (auth required)
- /data-sources — Data sources placeholder (auth required)
- /settings — User settings (auth required)

## Accessibility Requirements

- html lang="en" attribute on root element
- Meaningful page title in metadata
- VERIFY: EM-UI-002 — Layout has html lang="en" and metadata title

## Loading States

- Every route has a loading.tsx with role="status" and aria-busy="true"
- Skeleton UI with animate-pulse for content placeholders
- Screen-reader-only text describing what is loading

## Error Handling

- Every route has an error.tsx with role="alert"
- Error container auto-focused on mount via useRef
- Reset button allows retry
- Error message displayed to user

## UI Components

- shadcn/ui-style components in components/ui/
- Button, Input, Label, Card, Skeleton, Badge, Alert, Dialog, Select, Table
- All components use cn() utility for class merging
- VERIFY: EM-UI-001 — cn() utility combines clsx and tailwind-merge
- Focus-visible styles on all interactive elements
- Disabled states with pointer-events-none and opacity reduction

## Navigation

- Global nav component with aria-label="Main navigation"
- Links to all primary routes
- Consistent layout across all pages

## Cross-Layer Integration

- VERIFY: EM-CROSS-001 — AppModule wires all guards, filters, and interceptors as global providers
