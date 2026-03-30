# Frontend Specification

## Overview

Fleet Dispatch uses Next.js 15 with React 19, Tailwind CSS 4, and
shadcn/ui-style components. The web app provides a dashboard interface
for managing fleet operations including vehicles, drivers, routes,
dispatches, and maintenance records.

## UI Components

<!-- VERIFY: FD-UI-001 -->
The `cn()` utility function in `lib/utils.ts` combines clsx and
tailwind-merge for conditional class name composition. All UI
components use this utility for consistent styling.

## Component Library

The following shadcn/ui-style components are implemented:
- Button: primary, secondary, outline, ghost, destructive variants
- Card: header, title, description, content, footer sections
- Input: standard text input with label support
- Label: form label with htmlFor association
- Badge: status indicators with color variants
- Table: header, body, row, head, cell sub-components
- Skeleton: loading placeholder with pulse animation
- Alert: title and description with variant support
- Select: trigger, content, item, value sub-components

## Layout

<!-- VERIFY: FD-UI-002 -->
The root layout (`app/layout.tsx`) includes:
- HTML lang="en" attribute for accessibility
- Inter font via next/font/google
- Global CSS with Tailwind directives
- Navigation component with links to all routes
- Main content area with responsive padding

## Pages

### Login Page

<!-- VERIFY: FD-UI-003 -->
The login page provides email and password fields with a form that
calls the loginAction server action. On success, redirects to dashboard.

### Dashboard Page

<!-- VERIFY: FD-UI-004 -->
The dashboard displays fleet overview data including vehicle counts,
active dispatches, driver status, and maintenance alerts.

## Loading States

Every route includes a `loading.tsx` file with:
- `role="status"` on the outer container
- `aria-busy="true"` for assistive technology
- Skeleton components for visual loading indication

## Error States

Every route includes an `error.tsx` file with:
- `'use client'` directive for client-side rendering
- `role="alert"` on the outer container
- `useRef<HTMLDivElement>` for focus management
- `useEffect` to focus the error container on mount
- `tabIndex={-1}` for programmatic focus
- Retry button to attempt recovery

## Dark Mode

Global CSS uses `@media (prefers-color-scheme: dark)` for dark mode
support. CSS variables define color tokens that switch between light
and dark themes automatically. This avoids the `.dark` class pattern.

## Accessibility

<!-- VERIFY: FD-AX-001 -->
Accessibility tests use real `jest-axe` imports rendering actual
components. Tests verify no accessibility violations exist for
Button, Card, Input, Table, Badge, Alert, and Select components.

<!-- VERIFY: FD-AX-002 -->
Keyboard navigation tests use `userEvent` from testing-library to
verify tab order, enter activation, and space activation for
interactive elements like buttons and inputs.

## Cross-References

- See [authentication.md](authentication.md) for login flow details
- See [api-endpoints.md](api-endpoints.md) for server action endpoints
