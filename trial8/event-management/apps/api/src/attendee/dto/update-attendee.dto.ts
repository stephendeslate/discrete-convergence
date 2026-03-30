import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

// TRACED: EM-DATA-007 — Attendee update DTO
export class UpdateAttendeeDto {
  @IsOptional()
  @IsUUID()
  @IsString()
  @MaxLength(36)
  ticketId?: string;
}
