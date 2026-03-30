# Frontend Specification

## Overview

The Event Management frontend is built with Next.js 15 App Router, React 19,
and Tailwind CSS 4. It uses shadcn/ui-style components with the `cn()` utility
from clsx + tailwind-merge. Dark mode uses `@media (prefers-color-scheme: dark)`.

See [api-endpoints.md](api-endpoints.md) for backend API contract.

## Requirements

### VERIFY:EM-UI-001 — cn() Utility with clsx + tailwind-merge
The `cn()` utility function in `lib/utils.ts` combines `clsx` for conditional
class names with `twMerge` from tailwind-merge for Tailwind class deduplication.
All components use this utility for className composition.

### VERIFY:EM-UI-002 — Server Actions with Response Check
Server Actions in `lib/actions.ts` use the `'use server'` directive and check
`response.ok` before performing redirects. Failed responses return error objects
instead of redirecting.

### VERIFY:EM-UI-003 — Dark Mode via Media Query
Dark mode is implemented using `@media (prefers-color-scheme: dark)` in
`app/globals.css`. CSS custom properties switch between light and dark values.
The `.dark` class approach is NOT used.

### VERIFY:EM-UI-004 — Root Layout with Nav Component
The root `app/layout.tsx` includes a Nav component that renders a navigation bar
with links to Dashboard, Events, Venues, and Login pages.

### VERIFY:EM-FE-001 — Login Page with Server Action
The login page renders a form with email and password fields that submits to
the `loginAction` server action. The action checks `response.ok` before redirect.

### VERIFY:EM-AX-001 — jest-axe Accessibility Tests
Accessibility tests use real `jest-axe` imports rendering real shadcn/ui
components (Button, Input, Label, Card, Badge). Tests verify zero a11y violations.
Loading state tests verify `role="status"` + `aria-busy="true"`.
Error state tests verify `role="alert"`.

### VERIFY:EM-AX-002 — Keyboard Navigation Tests
Keyboard navigation tests use `@testing-library/user-event` to verify:
- Tab navigation between interactive elements
- Enter key activates buttons
- Space key activates buttons
- Typing in input fields works correctly

## Component Library

9 shadcn/ui-style components in `components/ui/`:
1. Button (variants: default, destructive, outline, secondary, ghost, link)
2. Input (text input with ring focus)
3. Label (form label)
4. Card (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter)
5. Badge (variants: default, secondary, destructive, outline)
6. Skeleton (loading placeholder)
7. Separator (horizontal/vertical divider)
8. Dialog (modal dialog)
9. Table (Table, TableHeader, TableBody, TableRow, TableHead, TableCell)

## Loading States

All routes include `loading.tsx` with:
- `role="status"` on outer container
- `aria-busy="true"` attribute
- Spinner animation with sr-only text

## Error States

All routes include `error.tsx` with:
- `role="alert"` on outer container
- `useRef<HTMLDivElement>` for focus management
- `useEffect` that focuses container on mount
- `tabIndex={-1}` for programmatic focus
- Reset button to retry

## Code Splitting

Dashboard and Events pages use `next/dynamic` for lazy loading with
Skeleton loading states via the `loading` option.
