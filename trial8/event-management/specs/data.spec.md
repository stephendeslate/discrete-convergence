# Data Spec

## EM-DATA-001 — Registration Rejects Invalid Role
- **VERIFY**: `test/auth.integration.spec.ts` — ADMIN role rejected at registration
- Roles guard uses ALLOWED_REGISTRATION_ROLES from shared package.

## EM-DATA-002 — Registration Rejects Missing Fields
- **VERIFY**: `test/auth.integration.spec.ts` — Missing fields return 400
- class-validator enforces all required fields on RegisterDto.

## EM-DATA-003 — Registration Rejects Invalid Email
- **VERIFY**: `test/auth.integration.spec.ts` — Invalid email format returns 400
- @IsEmail() decorator on RegisterDto.

## EM-DATA-004 — Ticket Creation DTO
- **TRACED**: `apps/api/src/ticket/dto/create-ticket.dto.ts`
- **VERIFY**: `test/ticket.integration.spec.ts` — Invalid ticket type returns 400
- class-validator: @IsUUID, @IsIn, @IsNumber, @Min.

## EM-DATA-005 — Ticket Update DTO
- **TRACED**: `apps/api/src/ticket/dto/update-ticket.dto.ts`
- class-validator: @IsOptional, @IsIn for status.

## EM-DATA-006 — Attendee Creation DTO
- **TRACED**: `apps/api/src/attendee/dto/create-attendee.dto.ts`
- class-validator: @IsUUID, @IsString, @IsOptional.

## EM-DATA-007 — Attendee Update DTO
- **TRACED**: `apps/api/src/attendee/dto/update-attendee.dto.ts`
- class-validator: @IsOptional, @IsUUID.

## EM-DATA-008 — Schedule Creation DTO
- **TRACED**: `apps/api/src/schedule/dto/create-schedule.dto.ts`
- class-validator: @IsUUID, @IsString, @IsDateString, @IsOptional, @MaxLength.

## EM-DATA-009 — Venue Update DTO
- **TRACED**: `apps/api/src/venue/dto/update-venue.dto.ts`
- class-validator: @IsOptional, @IsString, @MaxLength, @IsInt, @Min.

## EM-DATA-010 — Event Date Validation
- **VERIFY**: `test/event.integration.spec.ts` — End date before start date returns 400
- Business logic validation in EventService.create().

## Verification Tags
- VERIFY: EM-DATA-004
- VERIFY: EM-DATA-005
- VERIFY: EM-DATA-006
- VERIFY: EM-DATA-007
- VERIFY: EM-DATA-008
- VERIFY: EM-DATA-009
