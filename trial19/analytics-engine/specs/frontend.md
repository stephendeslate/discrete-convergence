# Frontend Specification

## Overview

Next.js 15 App Router with shadcn/ui components, server actions, and cookie-based authentication.

## Requirements

### AE-FE-001: Root Layout
- **VERIFY**: Root layout has `<html lang="en">` and metadata with title "Analytics Engine"
- Body applies global CSS variables for theming

### AE-FE-002: Login Page
- **VERIFY**: Login page uses useActionState for form handling with error display via role="alert"
- Form includes email and password fields with proper autocomplete attributes
- Submit button shows loading state with aria-busy

### AE-FE-003: Login Server Action
- **VERIFY**: Login server action stores JWT in httpOnly secure cookie and redirects to /dashboard
- Returns error state object on failure for form display

### AE-FE-004: Register Server Action
- **VERIFY**: Register server action calls /auth/register with role='USER' by default
- Stores token in httpOnly cookie on success

### AE-FE-005: Navigation Component
- **VERIFY**: Nav component uses aria-label="Main navigation" and aria-current="page" on active link
- Focus-visible ring on all interactive elements

### AE-FE-006: cn() Utility
- **VERIFY**: cn() function uses clsx + tailwind-merge for className composition
- Used consistently across all UI components

### AE-FE-007: Dashboard List Page
- **VERIFY**: Dashboard list renders as grid with role="list" and role="listitem" for accessibility
- Empty state shows descriptive message

### AE-FE-008: Error Boundary
- **VERIFY**: Error boundary uses role="alert" with useRef for focus management (tabIndex={-1})
- useEffect focuses heading on error change for screen reader announcement
