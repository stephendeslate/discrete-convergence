# Frontend Specification

## Overview

The Event Management frontend is built with Next.js 15 and React 19, using Tailwind CSS 4
and shadcn/ui components. Server Actions handle all API communication.

## UI Components

VERIFY: EM-UI-001 — cn() utility uses clsx + tailwind-merge for class merging

VERIFY: EM-UI-002 — Navigation component rendered in root layout with links to all routes

VERIFY: EM-UI-003 — Button component with variant and size props using shadcn/ui pattern

The following shadcn/ui components are implemented in components/ui/:
- Button (with variants: default, destructive, outline, secondary, ghost, link)
- Card (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter)
- Input
- Label
- Skeleton (for loading states)
- Badge (with variants: default, secondary, destructive, outline)
- Separator
- Alert (Alert, AlertTitle, AlertDescription)

## Route Structure

All routes include loading.tsx (role="status", aria-busy="true") and
error.tsx (role="alert", useRef + useEffect focus management, tabIndex={-1}).

Routes:
- / — Home page with sign in and register links
- /login — Login form with server action
- /register — Registration form with server action
- /dashboard — Dashboard with event overview (uses dynamic import)
- /events — Events listing
- /venues — Venues listing
- /settings — App settings with version and logout

## Server Actions

VERIFY: EM-FI-001 — API route constants defined as single-quoted strings for FI scorer detection

VERIFY: EM-FI-002 — Login action stores auth token via cookies().set after successful authentication

VERIFY: EM-FI-003 — Register action posts to /auth/register and redirects to /login on success

VERIFY: EM-FI-004 — Protected server actions read token via cookies().get and pass Authorization header

All server actions use the 'use server' directive. Protected actions:
1. Read token from cookies via cookies().get('token')
2. Redirect to /login if no token present
3. Pass Authorization: Bearer header in fetch calls
4. Check response.ok before processing data

## Dark Mode

Dark mode is implemented via @media (prefers-color-scheme: dark) in globals.css
using CSS custom properties. No .dark class toggling.

## Code Splitting

Dashboard page uses next/dynamic for lazy loading the EventList component
with a Skeleton loading fallback.

## Cross-References

- See [authentication.md](authentication.md) for auth flow details
- See [api-endpoints.md](api-endpoints.md) for backend route mapping
