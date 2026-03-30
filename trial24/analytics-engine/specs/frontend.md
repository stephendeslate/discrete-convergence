# Frontend Specification

## Overview

The Analytics Engine web frontend is a Next.js 15 application with React 19
and Tailwind CSS. It provides pages for authentication, dashboard management,
data source management, and settings. See [authentication.md](authentication.md) for auth flow.

## API Client

<!-- VERIFY:WEB-API -->
The `api.ts` module provides a typed HTTP client that handles auth token
injection, token refresh on 401 responses, and base URL configuration.
All API calls go through this client.

<!-- VERIFY:TEST-WEB-API -->
Tests for the API client verify token injection, automatic refresh on 401,
error handling for network failures, and correct base URL resolution.

## Server Actions

<!-- VERIFY:WEB-ACTIONS -->
Server actions in `actions.ts` handle data mutations (create, update, delete)
for dashboards and data sources. They use the API client and revalidate
Next.js cache after successful mutations.

<!-- VERIFY:TEST-WEB-ACTIONS -->
Tests for server actions verify that mutations call the correct API endpoints,
handle errors gracefully, and trigger cache revalidation.

## Pages

<!-- VERIFY:WEB-HOME -->
The home page redirects authenticated users to the dashboard list page.
Unauthenticated users are redirected to the login page.

<!-- VERIFY:WEB-LOGIN -->
The login page provides email/password form with validation and error display.
On success, tokens are stored and the user is redirected to dashboards.

<!-- VERIFY:WEB-REGISTER -->
The registration page provides a form for email, password, and name. On
successful registration, tokens are stored and the user is redirected.

<!-- VERIFY:WEB-DASHBOARD -->
The dashboard list page displays all dashboards for the current tenant with
pagination. It includes a create button that opens the create form.

<!-- VERIFY:WEB-DATASOURCES -->
The data sources page lists all configured data sources with their status
and type. It supports creating new data sources via the create form.

<!-- VERIFY:WEB-SETTINGS -->
The settings page displays the current user profile and provides options
for account management.

<!-- VERIFY:WEB-LAYOUT -->
The root layout provides the HTML shell, metadata, navigation, and shared
providers. It wraps all pages with authentication context.

## Components

<!-- VERIFY:WEB-CREATE-DASHBOARD-FORM -->
The create dashboard form collects name, description, and visibility settings.
It uses server actions for submission and validates inputs client-side.

<!-- VERIFY:WEB-CREATE-DATASOURCE-FORM -->
The create data source form collects name, type, and connection string.
It validates required fields and submits via server actions.

<!-- VERIFY:WEB-DASHBOARD-LIST -->
The dashboard list component renders a paginated grid of dashboard cards
with title, description, and action buttons for edit and delete.

<!-- VERIFY:WEB-DATASOURCE-LIST -->
The data source list component renders data sources with their name, type,
active status indicator, and management actions.

<!-- VERIFY:WEB-CREATE-WIDGET-FORM -->
The create widget form collects title, type, configuration JSON, and position.
It validates required fields and submits via server actions to create a new
widget within the selected dashboard.

<!-- VERIFY:WEB-WIDGET-LIST -->
The widget list component renders widgets within a dashboard view, showing
title, type, and position. It supports reordering and deletion.

<!-- VERIFY:WEB-WIDGETS-PAGE -->
The widgets management page displays widgets for a selected dashboard with
options to create, edit, and delete individual widgets.

## Shared UI

<!-- VERIFY:WEB-ERROR-BOUNDARY -->
The error boundary component catches rendering errors in child components
and displays a fallback UI with error details and retry option.

<!-- VERIFY:WEB-LOADING-SKELETON -->
The loading skeleton component provides placeholder animations during data
fetching, used across dashboard, data source, and widget list pages.

## Additional Pages

<!-- VERIFY:WEB-ANALYTICS-PAGE -->
The analytics overview page provides aggregated metrics and charts for the
current tenant, showing key performance indicators and trends.

<!-- VERIFY:WEB-REPORTS-PAGE -->
The reports page allows users to generate and view custom reports based on
dashboard data, with export options and date range filtering.

## Cross-References

- API authentication: see [authentication.md](authentication.md)
- API endpoints consumed: see [api-endpoints.md](api-endpoints.md)
- Security headers: see [security.md](security.md)
