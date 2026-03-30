# Frontend Specification

## Overview

The Fleet Dispatch web frontend is a Next.js 15 application with React 19 and
Tailwind CSS. It provides pages for authentication, vehicle management, driver
management, dispatches, and settings. See [authentication.md](authentication.md)
for auth flow.

## API Client

<!-- VERIFY:WEB-API-CLIENT -->
The `api.ts` module provides a typed HTTP client that handles auth token
injection, token refresh on 401 responses, and base URL configuration.
All API calls go through this client.

<!-- VERIFY:WEB-API-SPEC -->
Tests for the API client verify token injection, automatic refresh on 401,
error handling for network failures, and correct base URL resolution.

## Server Actions

<!-- VERIFY:WEB-ACTIONS -->
Server actions in `actions.ts` handle data mutations (create, update, delete)
for vehicles and drivers. They use the API client and revalidate Next.js
cache after successful mutations.

<!-- VERIFY:WEB-ACTIONS-SPEC -->
Tests for server actions verify that mutations call the correct API endpoints,
handle errors gracefully, and trigger cache revalidation.

## Pages

<!-- VERIFY:WEB-HOME-PAGE -->
The home page redirects authenticated users to the vehicles list page.
Unauthenticated users are redirected to the login page.

<!-- VERIFY:WEB-LOGIN-PAGE -->
The login page provides email/password form with validation and error display.
On success, tokens are stored and the user is redirected to vehicles.

<!-- VERIFY:WEB-REGISTER-PAGE -->
The registration page provides a form for email, password, and name. On
successful registration, tokens are stored and the user is redirected.

<!-- VERIFY:WEB-VEHICLES-PAGE -->
The vehicles page displays all vehicles for the current company with
pagination. It supports filtering by status and creating new vehicles.

<!-- VERIFY:WEB-DRIVERS-PAGE -->
The drivers page lists all drivers with their name, status, and license
number. It supports creating new drivers via the create form.

<!-- VERIFY:WEB-DISPATCHES-PAGE -->
The dispatches page displays active and historical dispatches with their
status, assigned vehicle, driver, and route information.

<!-- VERIFY:WEB-SETTINGS-PAGE -->
The settings page displays the current user profile and provides options
for account management within the company.

<!-- VERIFY:WEB-LAYOUT -->
The root layout provides the HTML shell, metadata, navigation sidebar, and
shared providers. It wraps all pages with authentication context.

## Components

<!-- VERIFY:WEB-CREATE-VEHICLE-FORM -->
The create vehicle form collects VIN, make, model, year, and license plate.
It uses server actions for submission and validates inputs client-side.

<!-- VERIFY:WEB-CREATE-DRIVER-FORM -->
The create driver form collects name, email, and license number. It validates
required fields and submits via server actions.

<!-- VERIFY:WEB-VEHICLE-LIST -->
The vehicle list component renders a paginated table of vehicles with VIN,
make/model, year, status badge, and action buttons.

<!-- VERIFY:WEB-DRIVER-LIST -->
The driver list component renders drivers with name, email, license number,
status indicator, and management actions.

<!-- VERIFY:WEB-DISPATCH-FORM -->
The dispatch form collects vehicle, driver, route, and scheduled date for
creating new dispatches. It validates all required fields and shows available
vehicles and drivers.

<!-- VERIFY:WEB-ROUTE-LIST -->
The route list component renders routes with name, origin, destination,
distance, and estimated time. It supports pagination.

## Additional Pages

<!-- VERIFY:WEB-ROUTES-PAGE -->
The routes page displays all routes for the current company with origin,
destination, distance, and estimated time information.

## Shared UI

<!-- VERIFY:WEB-ERROR-BOUNDARY -->
The error boundary component catches rendering errors in child components
and displays a fallback UI with error details and retry option.

<!-- VERIFY:WEB-LOADING-SKELETON -->
The loading skeleton component provides placeholder animations during data
fetching, used across vehicle, driver, and dispatch list pages.

## Cross-References

- API authentication: see [authentication.md](authentication.md)
- API endpoints consumed: see [api-endpoints.md](api-endpoints.md)
- Security headers: see [security.md](security.md)
