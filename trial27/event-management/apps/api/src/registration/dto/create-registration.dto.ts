// TRACED: EM-SEC-002 — Create registration DTO with validation
import { IsString, IsNotEmpty, MaxLength, IsEmail } from 'class-validator';

export class CreateRegistrationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(36)
  ticketTypeId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  attendeeName!: string;

  @IsEmail()
  @MaxLength(255)
  attendeeEmail!: string;
}
