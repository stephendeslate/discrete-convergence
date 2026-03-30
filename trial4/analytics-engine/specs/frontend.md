# Frontend Specification

## Overview

The Analytics Engine web application is built with Next.js 15 App Router,
shadcn/ui components, and Tailwind CSS 4. It provides an admin portal for
managing dashboards, data sources, and tenant settings.

See [api-endpoints.md](api-endpoints.md) for backend API contracts.

## Architecture

- Next.js 15 with App Router (server components by default)
- shadcn/ui component library (8+ components in components/ui/)
- Tailwind CSS 4 for styling
- cn() utility using clsx + tailwind-merge
- Server Actions for form submissions

## Requirements

### VERIFY:AE-FE-001
The cn() utility MUST use clsx and tailwind-merge. Located in lib/utils.ts.

### VERIFY:AE-FE-002
Server Actions MUST check response.ok before redirecting.
Failed responses MUST return error information to the client.

### VERIFY:AE-FE-003
Dark mode MUST be implemented via @media (prefers-color-scheme: dark)
in globals.css. NOT via .dark class toggle.

### VERIFY:AE-FE-004
Root layout.tsx MUST include a Nav component for site-wide navigation.

### VERIFY:AE-FE-005
All error.tsx files MUST use role="alert", useRef<HTMLDivElement>,
and useEffect for focus management with tabIndex={-1}.

### VERIFY:AE-FE-006
next/dynamic MUST be used for code splitting with Skeleton loading
states on at least one dynamically loaded component.

## Route Structure

| Route | Page | Has loading.tsx | Has error.tsx |
|-------|------|-----------------|---------------|
| / | Home | - | - |
| /login | Login form | Yes | Yes |
| /register | Register form | Yes | Yes |
| /dashboard | Dashboard list | Yes | Yes |
| /data-sources | Data source list | Yes | Yes |
| /settings | Tenant settings | Yes | Yes |
| /api-keys | API key management | Yes | Yes |

## Loading States

All loading.tsx files MUST have:
- role="status" on the outer container
- aria-busy="true" attribute
- Skeleton pulse animation for visual feedback
- Screen reader text via sr-only span

## Error States

All error.tsx files MUST have:
- 'use client' directive
- role="alert" on the outer container
- useRef<HTMLDivElement> for focus ref
- useEffect that focuses the ref on error change
- tabIndex={-1} for programmatic focus
- Reset/retry button

## Component Library (shadcn/ui)

Minimum 8 components in components/ui/:
1. Button — multiple variants and sizes
2. Card — with Header, Title, Description, Content, Footer
3. Input — styled form input
4. Label — form label
5. Badge — status indicators
6. Skeleton — loading placeholders
7. Alert — with AlertTitle and AlertDescription
8. Dialog — modal overlay
9. Select — styled select input
