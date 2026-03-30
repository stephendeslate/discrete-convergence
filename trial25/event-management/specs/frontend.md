# Frontend Specification

## Overview

The Event Management frontend is a Next.js 15 application using the App Router, server actions, and Tailwind CSS v4.
It provides a multi-page interface for managing events, venues, tickets, attendees, speakers, and sessions.
Frontend communicates with the API endpoints defined in [api-endpoints.md](api-endpoints.md).
Authentication flow uses the JWT tokens described in [authentication.md](authentication.md).

## Requirements

### EM-FE-001 — Layout and Navigation
The root layout provides a navigation bar with links to all domain pages.
Dark mode support uses Tailwind's dark: prefix classes.
<!-- VERIFY:EM-FE-001 — Layout provides accessible navigation with dark mode support -->

### EM-FE-002 — Authentication Pages
Login and register pages use server actions (form action={serverAction}).
All form controls have associated labels for accessibility.
<!-- VERIFY:EM-FE-002 — Auth pages use server actions with accessible form controls -->

### EM-FE-003 — Events Page
Events page displays event list and create-event form.
Supports viewing, creating events through the UI.
<!-- VERIFY:EM-FE-003 — Events page provides CRUD interface with form and list -->

### EM-FE-004 — Venues Page
Venues page displays venue list and create-venue form.
<!-- VERIFY:EM-FE-004 — Venues page provides CRUD interface with form and list -->

### EM-FE-005 — Domain Coverage
At least 6 domain route pages: events, venues, tickets, attendees, speakers, sessions.
Each page includes a list component showing domain entities.
<!-- VERIFY:EM-FE-005 — At least 3 domain pages exist with list components -->

### EM-FE-006 — Server Actions
Server actions file exports functions for login, register, createEvent, updateEvent, deleteEvent, createVenue, createTicket.
Write actions use POST, PUT, PATCH, or DELETE methods (at least 3 write actions).
<!-- VERIFY:EM-FE-006 — Server actions export 6+ functions with POST/PUT/DELETE methods -->

### EM-FE-007 — Error Boundary
Error boundary component catches and displays errors with role="alert".
<!-- VERIFY:EM-FE-007 — Error boundary displays error with role="alert" and focus management -->

### EM-FE-008 — Loading States
Loading skeleton component provides accessible loading feedback.
<!-- VERIFY:EM-FE-008 — Loading skeleton provides accessible loading state -->

### EM-FE-009 — API Client
API client handles Authorization header injection, error responses, and JSON serialization.
Uses fetch with configurable base URL from NEXT_PUBLIC_API_URL environment variable.
<!-- VERIFY:EM-FE-009 — API client handles auth headers, errors, and JSON serialization -->

### EM-FE-010 — Component Count
At least 8 component files in the components directory:
nav-bar, event-list, venue-list, ticket-list, create-event-form, create-venue-form, error-boundary, loading-skeleton, attendee-list.
<!-- VERIFY:EM-FE-010 — 8+ components exist in components directory -->

## Utility Functions

- `cn()` in lib/utils.ts uses clsx + tailwind-merge for conditional class composition
