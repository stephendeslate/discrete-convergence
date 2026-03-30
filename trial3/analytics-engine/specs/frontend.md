# Frontend Specification

## Overview

The Analytics Engine frontend is a Next.js 15 application using the App Router,
shadcn/ui component library, and Tailwind CSS 4. It provides pages for
authentication, dashboard management, data source configuration, and settings.

## Component Library

The application uses 9 shadcn/ui-style components in `components/ui/`:
Button, Card (with Header/Title/Description/Content/Footer), Input,
Label, Badge, Skeleton, Select, Table, and Alert.

### Utility Function

All components use the `cn()` utility for class name merging.

- VERIFY:AE-UI-001 — cn() utility uses clsx + tailwind-merge for
  conditional class name composition

## Server Actions

Server Actions handle form submissions with the 'use server' directive.
All actions check `response.ok` before redirecting to prevent silent failures.

- VERIFY:AE-UI-002 — Server Actions check response.ok before redirect
  and return error objects on failure

## Layout

The root layout includes a Nav component with links to all routes.
Dark mode is supported via `@media (prefers-color-scheme: dark)` in globals.css.

- VERIFY:AE-UI-003 — Root layout includes Nav component with navigation links

## Routes

Each route directory contains:
- `page.tsx` — Main page component
- `loading.tsx` — Loading state with accessibility attributes
- `error.tsx` — Error boundary with focus management

Routes: /dashboard, /data-sources, /login, /register, /settings

## Accessibility

### Loading States

All loading.tsx files use `role="status"` and `aria-busy="true"` on the
outer container element. Screen reader text is provided via `sr-only` class.

- VERIFY:AE-AX-001 — Loading states use role="status" and aria-busy="true"

### Error States

All error.tsx files use `role="alert"` with `useRef<HTMLDivElement>` and
`useEffect` for focus management. The container has `tabIndex={-1}` to
receive programmatic focus.

- VERIFY:AE-AX-002 — Error states use role="alert" with useRef and
  useEffect focus management

### Testing

Accessibility is verified with jest-axe tests that render real components
and check for WCAG violations.

- VERIFY:AE-AX-003 — Accessibility tests use real jest-axe imports
  rendering actual components

Keyboard navigation is verified with userEvent tab/enter/space tests
to ensure all interactive elements are keyboard accessible.

- VERIFY:AE-AX-004 — Keyboard navigation tests use userEvent for
  tab, enter, and space key interactions

## Dark Mode

Dark mode uses CSS custom properties with `@media (prefers-color-scheme: dark)`
in globals.css. The `.dark` class pattern is not used. All components
reference CSS variables (e.g., `var(--background)`) for theming.

## Code Splitting

Components can be loaded with `next/dynamic` for bundle optimization.
Loading states use the Skeleton component as fallback.
