# UI Spec

## EM-UI-001 — Root Layout
- **TRACED**: `apps/web/app/layout.tsx`
- Global nav, Tailwind CSS, semantic structure.

## EM-UI-002 — Home Redirect
- **TRACED**: `apps/web/app/page.tsx`
- Redirects to /dashboard.

## EM-UI-003 — Login Page
- **TRACED**: `apps/web/app/login/page.tsx`
- Client component with form, error handling, redirect on success.

## EM-UI-004 — Registration Page
- **TRACED**: `apps/web/app/register/page.tsx`
- Client component with role selection (USER/ORGANIZER only).

## EM-UI-005 — Dashboard Page
- **TRACED**: `apps/web/app/dashboard/page.tsx`
- Server component fetching events, summary cards, recent events table.

## EM-UI-006 — Events List Page
- **TRACED**: `apps/web/app/events/page.tsx`
- Card grid of events with status badges.

## EM-UI-007 — Event Detail Page
- **TRACED**: `apps/web/app/events/[id]/page.tsx`
- Shows venue, schedules, tickets for a single event.

## Verification Tags
- VERIFY: EM-UI-001
- VERIFY: EM-UI-002
- VERIFY: EM-UI-003
- VERIFY: EM-UI-004
- VERIFY: EM-UI-005
- VERIFY: EM-UI-006
- VERIFY: EM-UI-007
- VERIFY: EM-A11Y-001
- VERIFY: EM-A11Y-002
- VERIFY: EM-A11Y-003
- VERIFY: EM-A11Y-004
- VERIFY: EM-A11Y-005
- VERIFY: EM-A11Y-006
- VERIFY: EM-KB-001
- VERIFY: EM-KB-002
- VERIFY: EM-KB-003
- VERIFY: EM-KB-004
- VERIFY: EM-KB-005
