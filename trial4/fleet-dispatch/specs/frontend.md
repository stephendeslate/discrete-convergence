# Frontend Specification

## Overview

Fleet Dispatch uses Next.js 15 with the App Router, React 19, Tailwind CSS 4, and
shadcn/ui components. The frontend provides dispatch dashboard, work order management,
technician tracking, customer management, route optimization, and invoicing interfaces.

## Requirements

### VERIFY:FD-FRN-001 — cn() utility using clsx + tailwind-merge

The cn() utility function must combine clsx for conditional classes with tailwind-merge
for deduplication. Located at apps/web/lib/utils.ts. Used by all shadcn/ui components.

### VERIFY:FD-FRN-002 — Server Actions checking response.ok before redirect

Server Actions (apps/web/lib/actions.ts) must use 'use server' directive and check
response.ok before calling redirect(). Failed responses must return error messages
instead of redirecting. Actions import APP_VERSION from shared.

### VERIFY:FD-FRN-003 — Root layout with Nav component

The root layout.tsx must include a Nav component with links to all major routes:
dashboard, work-orders, technicians, customers, routes, invoices, login. The layout
applies global styles and wraps children in a main element.

### VERIFY:FD-FRN-004 — shadcn/ui component library (8+ components)

The apps/web/components/ui/ directory must contain at least 8 shadcn/ui-style components:
Button, Input, Label, Card, Badge, Skeleton, Select, Dialog, Table. All components
use the cn() utility for class merging.

### VERIFY:FD-AX-001 — Accessibility tests with jest-axe

Accessibility tests must use real jest-axe imports (not mocked) and render real components.
Tests must verify Button, Input+Label, Card, and Badge have no a11y violations.
Loading states must have role="status" + aria-busy="true". Error states must have role="alert".

### VERIFY:FD-AX-002 — Keyboard navigation tests with userEvent

Keyboard tests must use @testing-library/user-event for Tab, Enter, and Space key testing.
Tests must verify: button focus via Tab, button activation via Enter and Space, tab order
through multiple form elements, text input via keyboard.

## Dark Mode

Dark mode is implemented via `@media (prefers-color-scheme: dark)` in globals.css.
CSS custom properties switch between light and dark values. No `.dark` class-based approach.

## Route Structure

Every route directory contains:
- `page.tsx` — Route content
- `loading.tsx` — Loading state with role="status" and aria-busy="true"
- `error.tsx` — Error boundary with role="alert", useRef, and focus management

## Related Specifications

- See [api-endpoints.md](api-endpoints.md) for backend API contracts
- See [monitoring.md](monitoring.md) for error reporting
