# Frontend Specification

> **Project:** Analytics Engine
> **Category:** FE
> **Related:** See [api-endpoints.md](api-endpoints.md) for API contracts, see [security.md](security.md) for CSP constraints on frontend assets

---

## Overview

The analytics engine frontend is a Next.js 15 App Router application with shadcn/ui components and Tailwind CSS 4. It provides a dashboard builder, data source configuration, and user management UI. Authentication tokens are managed via httpOnly cookies for security. All routes implement loading and error states with proper accessibility attributes.

---

## Requirements

### VERIFY: AE-FE-001 — Token stored via httpOnly cookie after login

After successful login, the JWT access token is stored in an httpOnly cookie set by the server action. The cookie is configured with `httpOnly: true`, `secure: true` (in production), `sameSite: 'lax'`, and `path: '/'`. Tokens are never stored in localStorage or sessionStorage to prevent XSS token theft. The login server action calls the API, receives the token, and uses `cookies().set()` from `next/headers` to persist it. On logout, the cookie is cleared via `cookies().delete()`. The refresh token is stored in a separate httpOnly cookie.

### VERIFY: AE-FE-002 — Protected server actions include Authorization bearer header

All server actions that call protected API endpoints include the `Authorization: Bearer <token>` header by reading the token from the httpOnly cookie via `cookies().get()`. The server action pattern is:
1. Read token from cookie
2. If no token, redirect to `/login`
3. Call API with `headers: { Authorization: \`Bearer \${token}\` }`
4. Check `response.ok` before processing
5. On 401 response, clear cookie and redirect to `/login`

Server actions use the `'use server'` directive and are defined in `lib/actions.ts` or colocated action files.

### VERIFY: AE-FE-003 — loading.tsx with role="status" aria-busy="true" in all routes

Every route directory (`app/`, `app/login/`, `app/register/`, `app/dashboard/`, `app/data-sources/`, `app/settings/`) contains a `loading.tsx` file. Each loading component renders a container element with `role="status"` and `aria-busy="true"` attributes. Loading states display skeleton placeholders that match the page layout structure. The `role="status"` attribute creates a live region so screen readers announce when loading begins, and `aria-busy="true"` indicates the content is not yet ready.

### VERIFY: AE-FE-004 — error.tsx with role="alert" ref focus management in all routes

Every route directory contains an `error.tsx` file implementing the Next.js error boundary pattern. Each error component: (1) declares `'use client'` since error boundaries must be client components, (2) has `role="alert"` on the outer container element, (3) uses `useRef<HTMLDivElement>` for the alert element, (4) calls `ref.current?.focus()` inside a `useEffect` on mount, (5) sets `tabIndex={-1}` on the container to receive programmatic focus. This ensures screen readers immediately announce the error and keyboard users can interact with the error UI.

---

## Route Structure

```
apps/web/app/
  layout.tsx        — Root layout with Nav component, metadata
  page.tsx          — Home / redirect to dashboard
  loading.tsx       — Root loading state (role="status")
  error.tsx         — Root error boundary (role="alert")
  login/
    page.tsx        — Login form with email/password
    loading.tsx     — Login loading skeleton
    error.tsx       — Login error boundary
  register/
    page.tsx        — Registration form with role selector
    loading.tsx     — Register loading skeleton
    error.tsx       — Register error boundary
  dashboard/
    page.tsx        — Dashboard list and builder
    loading.tsx     — Dashboard loading skeleton
    error.tsx       — Dashboard error boundary
  data-sources/
    page.tsx        — Data source management and sync
    loading.tsx     — Data sources loading skeleton
    error.tsx       — Data sources error boundary
  settings/
    page.tsx        — Tenant settings and configuration
    loading.tsx     — Settings loading skeleton
    error.tsx       — Settings error boundary
```

---

## Component Inventory

| Component | Source | Usage |
|-----------|--------|-------|
| Button | shadcn/ui | All forms, actions, navigation |
| Card | shadcn/ui | Dashboard cards, data source cards |
| Input | shadcn/ui | All form text inputs |
| Label | shadcn/ui | Form field labels |
| Select | shadcn/ui | Widget type, data source type, role |
| Table | shadcn/ui | Data tables, sync history display |
| Badge | shadcn/ui | Status indicators (DRAFT, PUBLISHED) |
| Dialog | shadcn/ui | Confirmation modals, widget config |

---

## Dark Mode

Dark mode uses `@media (prefers-color-scheme: dark)` in `globals.css` with CSS custom properties. The `.dark` class approach is NOT used. Color tokens switch automatically based on system preference.
