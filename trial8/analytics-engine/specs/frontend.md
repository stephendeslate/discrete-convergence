# Frontend Specification

> **Project:** Analytics Engine
> **Category:** FE
> **Related:** See [api-endpoints.md](api-endpoints.md) for API routes, see [authentication.md](authentication.md) for auth flow

---

## Overview

The analytics engine frontend is built with Next.js 15 App Router, React 19, and Tailwind CSS 4. It provides authenticated views for dashboards, data sources, and settings. The UI uses shadcn/ui-style components built with `cn()` utility (clsx + tailwind-merge). Dark mode uses CSS media query, not JavaScript class toggling.

---

## Requirements

### VERIFY:AE-FE-001 — Next.js App Router with shadcn/ui components

The frontend uses Next.js 15 App Router with 8 shadcn/ui-style components in `components/ui/`: Button, Card, Input, Label, Select, Table, Badge, Dialog. Each component uses `forwardRef` and the `cn()` utility for className merging. The root layout imports `APP_VERSION` from the shared package.

### VERIFY:AE-FE-002 — Loading states with accessibility

All route segments provide `loading.tsx` components with `role="status"` and `aria-busy="true"` attributes for accessibility. Loading states render skeleton placeholders matching the layout of the target page. An `sr-only` span provides screen reader text.

### VERIFY:AE-FE-003 — Error boundaries with focus management

All route segments provide `error.tsx` client components with `role="alert"`, `useRef`, and `tabIndex={-1}`. The error div receives focus on mount via `useEffect` + `ref.current?.focus()`. A "Try again" button calls the `reset` function to retry the failed operation.

### VERIFY:AE-FE-004 — Dark mode via media query

Dark mode is implemented via `@media (prefers-color-scheme: dark)` in `globals.css` using CSS custom properties. The application does NOT use `.dark` class toggling or JavaScript-based theme switching. CSS variables include `--background`, `--foreground`, `--card`, `--primary`, `--muted`, `--border`, `--destructive`.

### VERIFY:AE-FE-005 — Server actions with cookie-based auth

Server actions in `lib/actions.ts` use the `'use server'` directive. The login action stores the JWT token via `cookies().set('token', data.access_token, { httpOnly: true })`. Protected actions read the token from cookies and pass it as an `Authorization: Bearer` header. All API calls check `response.ok` before processing data.

---

## Route Structure

| Route | Type | Description |
|-------|------|-------------|
| `/` | Page | Landing/home page |
| `/login` | Page | Login form (client component) |
| `/register` | Page | Registration form (client component) |
| `/dashboard` | Page | Dashboard list (server component) |
| `/data-sources` | Page | Data source list (server component) |
| `/settings` | Page | Tenant configuration page |

Each route has `loading.tsx` and `error.tsx` boundary components.
