# Frontend Specification

## Overview
Next.js 15 App Router with React 19, Tailwind CSS 4, and shadcn/ui components.

### VERIFY: EM-FE-001 — cn() utility uses clsx + tailwind-merge
The `cn()` function in `lib/utils.ts` merges class names using clsx and tailwind-merge.

### VERIFY: EM-FE-002 — Server actions in lib/actions.ts
The `lib/actions.ts` file uses `'use server'` directive and exports write actions for events and venues.

### VERIFY: EM-FE-003 — createEvent server action
POST /events with auth token and event data. Returns success/error result.

### VERIFY: EM-FE-004 — updateEvent server action
PATCH /events/:id with auth token and update data. Returns success/error result.

### VERIFY: EM-FE-005 — deleteEvent server action
DELETE /events/:id with auth token. Returns success/error result.

### VERIFY: EM-FE-006 — createVenue server action
POST /venues with auth token and venue data. Returns success/error result.

### VERIFY: EM-FE-007 — 8+ shadcn/ui components in components/ui/
Components: Button, Card, Input, Label, Table, Badge, Dialog, Select, Skeleton, Toast.

### VERIFY: EM-FE-008 — Root layout with html lang="en" and dark mode
Layout sets `<html lang="en">` and includes dark class for dark mode support.

### VERIFY: EM-FE-009 — Navigation with aria-label="Main navigation"
Nav element has proper aria-label for accessibility.

### VERIFY: EM-FE-010 — Login page with form validation and error display
Login page has labeled inputs and role="alert" for error messages.

### VERIFY: EM-FE-011 — Register page with form validation
Register page has labeled inputs for email, password, and organization.

### VERIFY: EM-FE-012 — Dashboard overview with metric cards
Dashboard displays summary cards for events, venues, and registrations.

### VERIFY: EM-FE-013 — Events list page with table and server action integration
Events page displays a table of events with name, status, dates, and venue. Uses `fetchEvents` server action from `lib/actions.ts`.

### VERIFY: EM-FE-014 — Venues page with table and server action integration
Venues page displays a table of venues with name, address, and capacity. Uses `fetchVenues` server action from `lib/actions.ts`.

### VERIFY: EM-FE-015 — Registrations page with table
Registrations page displays a table of registrations with attendee, email, event, ticket type, status, and date.

### VERIFY: EM-FE-016 — Audit log page with activity history table
Audit log page displays a table of audit entries with action, entity, entity ID, user, and date. Uses `fetchAuditLog` server action.

### VERIFY: EM-FE-017 — Settings page with organization configuration
Settings page provides form fields for organization name and plan tier selection.

### VERIFY: EM-FE-018 — Accessibility tests for frontend components
Accessibility test suite validates proper ARIA attributes, semantic HTML, and keyboard navigation.
