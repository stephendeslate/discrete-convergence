# Frontend Specification

## Overview

The Event Management web frontend is a Next.js 15 application with React 19
and Tailwind CSS. It provides pages for authentication, event management,
venue management, and settings. See [authentication.md](authentication.md) for auth flow.

## API Client

<!-- VERIFY:WEB-API -->
The `api.ts` module provides a typed HTTP client that handles auth token
injection, token refresh on 401 responses, and base URL configuration.
All API calls go through this client.

<!-- VERIFY:WEB-API-SPEC -->
Tests for the API client verify token injection, automatic refresh on 401,
error handling for network failures, and correct base URL resolution.

## Server Actions

<!-- VERIFY:WEB-ACTIONS -->
Server actions in `actions.ts` handle data mutations (create, update, delete)
for events and venues. They use the API client and revalidate Next.js cache
after successful mutations.

<!-- VERIFY:WEB-ACTIONS-SPEC -->
Tests for server actions verify that mutations call the correct API endpoints,
handle errors gracefully, and trigger cache revalidation.

## Pages

<!-- VERIFY:WEB-HOME -->
The home page redirects authenticated users to the events list page.
Unauthenticated users are redirected to the login page.

<!-- VERIFY:WEB-LOGIN -->
The login page provides email/password form with validation and error display.
On success, tokens are stored and the user is redirected to events.

<!-- VERIFY:WEB-REGISTER -->
The registration page provides a form for email, password, and name. On
successful registration, tokens are stored and the user is redirected.

<!-- VERIFY:WEB-EVENTS-PAGE -->
The events page displays all events for the current organization with
pagination. It supports filtering by status and creating new events.

<!-- VERIFY:WEB-VENUES-PAGE -->
The venues page lists all configured venues with their name, address, and
capacity. It supports creating new venues via the create form.

<!-- VERIFY:WEB-SETTINGS-PAGE -->
The settings page displays the current user profile and provides options
for account management within the organization.

<!-- VERIFY:WEB-LAYOUT -->
The root layout provides the HTML shell, metadata, navigation sidebar, and
shared providers. It wraps all pages with authentication context.

## Components

<!-- VERIFY:WEB-CREATE-EVENT-FORM -->
The create event form collects title, description, dates, venue, and status.
It uses server actions for submission and validates inputs client-side.

<!-- VERIFY:WEB-CREATE-VENUE-FORM -->
The create venue form collects name, address, and capacity. It validates
required fields and submits via server actions.

<!-- VERIFY:WEB-EVENT-LIST -->
The event list component renders a paginated list of event cards with title,
dates, status badge, and action buttons for edit and delete.

<!-- VERIFY:WEB-VENUE-LIST -->
The venue list component renders venues with their name, address, capacity
indicator, and management actions.

<!-- VERIFY:WEB-SESSION-LIST -->
The session list component renders sessions for an event with title, time
range, and assigned speaker name.

<!-- VERIFY:WEB-SPEAKER-LIST -->
The speaker list component renders speakers with name, email, bio excerpt,
and the number of assigned sessions.

<!-- VERIFY:WEB-TICKET-LIST -->
The ticket list component renders ticket types for an event with type name,
price, available quantity, and management actions.

## Additional Pages

<!-- VERIFY:WEB-SESSIONS-PAGE -->
The sessions page displays sessions for a selected event with options to
create, edit, and delete individual sessions.

<!-- VERIFY:WEB-SPEAKERS-PAGE -->
The speakers page lists all speakers in the organization with their profiles
and session assignments.

<!-- VERIFY:WEB-TICKETS-PAGE -->
The tickets page displays ticket types for a selected event with pricing
and quantity information.

## Shared UI

<!-- VERIFY:WEB-ERROR-BOUNDARY -->
The error boundary component catches rendering errors in child components
and displays a fallback UI with error details and retry option.

<!-- VERIFY:WEB-LOADING-SKELETON -->
The loading skeleton component provides placeholder animations during data
fetching, used across event, venue, and session list pages.

## Cross-References

- API authentication: see [authentication.md](authentication.md)
- API endpoints consumed: see [api-endpoints.md](api-endpoints.md)
- Security headers: see [security.md](security.md)
