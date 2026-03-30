import { IsString, IsUUID, IsOptional, MaxLength } from 'class-validator';

// TRACED: EM-DATA-006 — Attendee creation DTO
export class CreateAttendeeDto {
  @IsUUID()
  @IsString()
  @MaxLength(36)
  eventId!: string;

  @IsUUID()
  @IsString()
  @MaxLength(36)
  userId!: string;

  @IsOptional()
  @IsUUID()
  @IsString()
  @MaxLength(36)
  ticketId?: string;
}
