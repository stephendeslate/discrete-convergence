import { IsUUID, IsString, IsEmail } from 'class-validator';

export class CreateRegistrationDto {
  @IsUUID()
  ticketTypeId: string;

  @IsString()
  attendeeName: string;

  @IsEmail()
  attendeeEmail: string;
}
