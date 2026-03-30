// TRACED:ATTENDEE-DTO
import { IsString, IsEmail, IsUUID, MaxLength } from 'class-validator';

export class CreateAttendeeDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsEmail()
  email!: string;

  @IsUUID()
  ticketId!: string;

  @IsUUID()
  eventId!: string;
}
