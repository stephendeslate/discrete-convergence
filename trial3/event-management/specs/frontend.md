# Frontend Specification

## Overview

The Event Management frontend is a Next.js 15 application using the App Router pattern.
It uses shadcn/ui components styled with Tailwind CSS 4 and supports dark mode via
`@media (prefers-color-scheme: dark)`.

## Component Library

The application uses 9+ shadcn/ui components in `components/ui/`:
Button, Card, Input, Label, Badge, Skeleton, Table, Alert, Select.

## Requirements

### VERIFY:EM-UI-001
The cn() utility must use clsx + tailwind-merge for class merging.
Located in lib/utils.ts.

### VERIFY:EM-UI-002
Server Actions in lib/actions.ts must use 'use server' directive.
Actions must check response.ok before redirect.
Actions must import APP_VERSION from shared package.

### VERIFY:EM-UI-003
Nav component must be present in root layout.tsx with navigation links.
Must include aria-label="Main navigation" for accessibility.

### VERIFY:EM-UI-004
Root layout.tsx must import and render the Nav component.
Must set lang="en" on the html element.

### VERIFY:EM-UI-005
Settings page must display APP_VERSION from the shared package.
At least 3 web app files must import from @event-management/shared.

## Route Structure

All routes have loading.tsx and error.tsx boundary components:
- /dashboard — Admin dashboard with event and registration stats
- /events — Event list with create button
- /venues — Venue management table
- /registrations — Registration tracking
- /login — Sign-in form
- /register — Account creation form
- /settings — Organization settings
- /public-events — Public event discovery

## Loading States

- All loading.tsx files use `role="status"` and `aria-busy="true"` on outer container
- Loading states render Skeleton components for visual feedback

## Error States

- All error.tsx files use `role="alert"` on outer container
- Error states use `useRef<HTMLDivElement>` and `useEffect` for focus management
- Error container has `tabIndex={-1}` for programmatic focus

## Dark Mode

- Implemented via `@media (prefers-color-scheme: dark)` in globals.css
- Uses CSS custom properties for theming
- Not implemented via `.dark` class toggle

## Code Splitting

- Dashboard uses `next/dynamic` for lazy-loading stats component
- Dynamic imports use Skeleton components as loading fallbacks

## Accessibility

- Forms use Label + Input pairs with htmlFor/id bindings
- Interactive elements support keyboard navigation (Tab, Enter, Space)
- ARIA attributes on loading and error states
- See [cross-layer.md](cross-layer.md) for integration verification
