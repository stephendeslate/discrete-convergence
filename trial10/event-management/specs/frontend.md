# Frontend Specification

> **Project:** Event Management
> **Category:** FE
> **Related:** See [api-endpoints.md](api-endpoints.md) for API contracts, see [security.md](security.md) for CSP constraints on frontend assets

---

## Overview

The event management frontend is a Next.js 15 App Router application with shadcn/ui components and Tailwind CSS 4. It provides event listing, venue management, registration tracking, and settings configuration. Dark mode is implemented via `@media (prefers-color-scheme: dark)` — not the `.dark` class approach.

---

## Requirements

### VERIFY:EM-FE-001 — Next.js App Router with shadcn/ui components

The web application uses Next.js 15 App Router with at least 8 shadcn/ui components in `apps/web/components/ui/`. Components include Button, Card, Input, Label, Select, Table, Badge, Dialog. The `cn()` utility in `lib/utils.ts` uses `clsx` + `tailwind-merge` for conditional class merging.

### VERIFY:EM-FE-002 — Loading states with accessibility attributes

Every route directory has a `loading.tsx` file with `role="status"` and `aria-busy="true"` on the outer container element. Loading states display skeleton placeholders matching the page layout. These attributes ensure screen readers announce loading state transitions.

### VERIFY:EM-FE-003 — Error boundaries with focus management

Every route directory has an `error.tsx` file with `role="alert"` on the outer container, `useRef<HTMLDivElement>` for the alert element, and `useEffect` that calls `ref.current?.focus()` on mount. The error container has `tabIndex={-1}` to receive programmatic focus. This ensures screen readers immediately announce errors.

### VERIFY:EM-FE-004 — Dark mode via media query

Dark mode is implemented using `@media (prefers-color-scheme: dark)` in `globals.css`. The `.dark` class approach is NOT used. CSS custom properties define color tokens that switch between light and dark values based on the media query. All components respect the system color scheme preference.

### VERIFY:EM-FE-005 — Server actions with error handling

Server actions use `'use server'` directive and check `response.ok` before redirecting. Failed API calls display user-facing error messages rather than silently failing. Cookie-based token storage with `httpOnly`, `secure`, and `sameSite` attributes provides secure session management. Route constants are defined as single-quoted string literals.

---

## Route Structure

```
apps/web/app/
  layout.tsx        — Root layout with Nav component
  page.tsx          — Home page
  loading.tsx       — Root loading state
  error.tsx         — Root error boundary
  login/
    page.tsx        — Login form
    loading.tsx
    error.tsx
  register/
    page.tsx        — Registration form with role selection
    loading.tsx
    error.tsx
  dashboard/
    page.tsx        — Dashboard with event stats
    loading.tsx
    error.tsx
  events/
    page.tsx        — Event list table
    loading.tsx
    error.tsx
  venues/
    page.tsx        — Venue list table
    loading.tsx
    error.tsx
  settings/
    page.tsx        — Tenant settings
    loading.tsx
    error.tsx
```

---

## Component Inventory

| Component | Source | Usage |
|-----------|--------|-------|
| Button | shadcn/ui | All forms, actions |
| Card | shadcn/ui | Dashboard cards, event cards |
| Input | shadcn/ui | All form inputs |
| Label | shadcn/ui | Form field labels |
| Select | shadcn/ui | Role selection, filters |
| Table | shadcn/ui | Event/venue tables |
| Badge | shadcn/ui | Status indicators |
| Dialog | shadcn/ui | Confirmations, forms |
