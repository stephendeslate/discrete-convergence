# Frontend Specification

## Overview
Next.js 15 App Router with React 19, Tailwind CSS 4, shadcn/ui components, and server actions.

### VERIFY: FD-FE-001 — Login page at /login
Login form with email and password fields. Submits to POST /auth/login. Redirects to /dashboard on success. Shows error with role="alert".
The form uses controlled inputs with React state for email and password.
Validation: HTML5 required attribute on both fields prevents empty submissions.
Error display: API error messages are shown in a div with `role="alert"` for screen reader accessibility.
Loading state: The submit button shows "Signing in..." and is disabled during the API call.

### VERIFY: FD-FE-002 — Register page at /register
Registration form with email, password, and organization name. Submits to POST /auth/register. Redirects to /dashboard.
Password field has `minLength={8}` for client-side validation.
Organization name is sent as `organizationName` in the request body.
Error handling follows the same pattern as the login page with `role="alert"` for error display.
On success, the JWT token is stored in localStorage and the user is redirected.

### VERIFY: FD-FE-003 — Dashboard overview at /dashboard
Shows fleet summary: total vehicles, active drivers, pending jobs, completed jobs. Uses Card components for metrics.
Data is fetched from three API endpoints in parallel using Promise.all for performance.
Each metric is displayed in a Card with a title and a large numeric value.
Loading state shows Skeleton components while data is being fetched.
The dashboard serves as the main landing page after login.

### VERIFY: FD-FE-004 — Vehicles page at /vehicles
Lists vehicles in a Table with name, plate, type, status, mileage. Supports create via Dialog, edit, and delete.
Status is displayed as a colored Badge component with semantic variants.
The "Add Vehicle" button triggers a quick-create action with a default name and auto-generated plate.
Loading state displays Skeleton rows to maintain layout stability during data fetch.
Empty state shows a centered message when no vehicles exist for the tenant.

### VERIFY: FD-FE-005 — Drivers page at /drivers
Lists drivers in a Table with name, email, license, status. Supports CRUD operations.
Status toggle button allows switching between AVAILABLE and OFF_DUTY states.
The table supports sorting and the Badge component indicates driver availability.
Empty state displays guidance text when no drivers are registered.

### VERIFY: FD-FE-006 — Dispatch jobs page at /dispatch-jobs
Lists jobs with origin, destination, status, vehicle, driver. Supports create, assign, complete, cancel actions.
Status is shown as a Badge with semantic color coding: PENDING (outline), IN_PROGRESS (default), COMPLETED (secondary), CANCELLED (destructive).
Vehicle and driver columns show the assigned name or a dash if unassigned.
Cancel and delete actions are available per row for job management.

### VERIFY: FD-FE-007 — Maintenance page at /maintenance
Scoped to a vehicle. Lists maintenance logs with type, description, cost, date. Supports creating new logs.
The page displays a prompt to select a vehicle from the Vehicles page when no vehicle is selected.
Table columns: Type, Description, Cost, Date.
Empty state shows "No maintenance logs to display" centered in the table.

### VERIFY: FD-FE-008 — Audit log page at /audit-log
Read-only table of audit entries with action, entity, timestamp.
Data is fetched with JWT authentication from the /audit-log API endpoint.
Timestamps are formatted using `toLocaleString()` for the user's locale.
Entity IDs are displayed in a monospace font for readability.
The table is read-only with no create, edit, or delete actions.

### VERIFY: FD-FE-009 — Settings page at /settings
Displays tenant info and user profile. Placeholder for future settings.
Organization card shows name and plan tier (currently disabled/read-only inputs).
Profile card shows email and role.
A "Change Password" button is present but disabled as a placeholder for future implementation.
All form inputs use proper Label-Input associations with htmlFor/id attributes.

### VERIFY: FD-FE-010 — HTML lang and dark mode
Root layout sets `<html lang="en">` with dark mode class support via Tailwind.
The `lang="en"` attribute ensures screen readers use the correct language pronunciation.
Dark mode is enabled by default via the `className="dark"` attribute on the html element.
The body element uses Tailwind dark mode variants for background and text colors.

### VERIFY: FD-FE-011 — Navigation with aria-label
Main navigation component has `aria-label="Main navigation"` and links to all pages.
Active link is highlighted with a different background color for visual indication.
Navigation includes links to: Dashboard, Vehicles, Drivers, Dispatch Jobs, Maintenance, Audit Log, Settings.
The nav uses semantic `<nav>` element with proper ARIA labeling for accessibility.
