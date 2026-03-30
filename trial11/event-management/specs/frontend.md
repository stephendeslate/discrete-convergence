# Frontend Specification

## Overview

The frontend is a Next.js 15 application using server actions for API
communication. It uses shadcn/ui components with Tailwind CSS for styling
and provides full keyboard accessibility.

## UI Components

### EM-UI-001: Utility Functions

- VERIFY: EM-UI-001 — The cn() utility combines clsx and tailwind-merge
  for conditional class name composition without conflicts.

### EM-UI-002: Button Component

- VERIFY: EM-UI-002 — Button component uses class-variance-authority for
  variant styling (default, destructive, outline, secondary, ghost, link)
  with size options (default, sm, lg, icon).

### EM-UI-003: Navigation Component

- VERIFY: EM-UI-003 — Nav component renders a responsive navigation bar
  with links to dashboard, events, and auth pages. Uses semantic HTML
  nav element with proper ARIA landmarks.

### EM-UI-004: Root Layout

- VERIFY: EM-UI-004 — Root layout wraps all pages with the Nav component,
  sets HTML lang="en", and includes global CSS with dark mode support.

### EM-UI-005: Login Page

- VERIFY: EM-UI-005 — Login page renders a card-based form with labeled
  email and password inputs. Uses server action for form submission.
  All inputs have htmlFor/id pairing for accessibility.

### EM-UI-006: Dashboard Page

- VERIFY: EM-UI-006 — Dashboard page displays event management overview
  with authenticated data fetched via server actions.

## Server Actions (Functional Integration)

### EM-FI-001: Login Action

- VERIFY: EM-FI-001 — loginAction server action sends credentials to
  the API login endpoint and stores the JWT token in an httpOnly cookie
  using cookies().set().

### EM-FI-002: Register Action

- VERIFY: EM-FI-002 — registerAction server action sends registration
  data to the API register endpoint with proper error handling.

### EM-FI-003: Fetch Events Action

- VERIFY: EM-FI-003 — fetchEventsAction sends GET request to the events
  endpoint with Authorization Bearer header from the stored cookie.

### EM-FI-004: Create Event Action

- VERIFY: EM-FI-004 — createEventAction sends POST request to the events
  endpoint with Authorization Bearer header and JSON body.

## Accessibility

### EM-AX-001: ARIA Compliance

- VERIFY: EM-AX-001 — Accessibility tests verify that all form inputs
  have associated labels, buttons have accessible names, and ARIA
  landmarks (main, nav, form) are present on key pages.

### EM-AX-002: Keyboard Navigation

- VERIFY: EM-AX-002 — Keyboard tests verify tab navigation order through
  form fields, keyboard-operable buttons, and focus management across
  login, register, and home pages.

## Loading and Error States

- Every route has a loading.tsx with role="status" and aria-busy="true".
- Every route has an error.tsx with role="alert" and auto-focus via useRef.
- Loading states use Skeleton components for visual feedback.
- Error states display descriptive messages with retry buttons.

## Dark Mode

- Global CSS includes @media (prefers-color-scheme: dark) for automatic
  dark mode based on system preferences.

## Test Coverage

- Frontend tests import real page components (not inline fixtures).
- Tests cover form rendering, label associations, ARIA attributes,
  keyboard navigation, and interactive form field typing.
