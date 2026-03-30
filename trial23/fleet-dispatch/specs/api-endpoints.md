# API Endpoints Specification

## Overview
RESTful API endpoints with consistent pagination, tenant scoping, and role-based access control.

## Requirements

### FD-API-001: Work Order CRUD
<!-- VERIFY: FD-API-001 -->
Full CRUD operations for work orders with tenant scoping via companyId. Supports status transitions through the 9-state work order lifecycle.

### FD-API-002: Technician CRUD
<!-- VERIFY: FD-API-002 -->
CRUD operations for technician profiles with tenant scoping. Includes availability tracking and specialties management.

### FD-API-003: Customer CRUD
<!-- VERIFY: FD-API-003 -->
CRUD operations for customers with tenant scoping. Supports address and contact information management.

### FD-API-004: Pagination Envelope
<!-- VERIFY: FD-API-004 -->
All list endpoints return { data, meta: { page, limit, total, totalPages } } envelope format with clamped pagination parameters.

### FD-API-005: Dashboard CRUD
<!-- VERIFY: FD-API-005 -->
CRUD operations for dashboards with tenant scoping. Supports widget management and layout configuration.

### FD-API-006: Data Source CRUD
<!-- VERIFY: FD-API-006 -->
CRUD operations for data sources with tenant scoping. Includes connection testing and sync status tracking.
