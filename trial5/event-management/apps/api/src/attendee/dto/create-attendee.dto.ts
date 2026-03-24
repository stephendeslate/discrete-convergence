import { IsString, IsEmail, IsOptional, IsIn, MaxLength, IsUUID } from 'class-validator';

export class CreateAttendeeDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsOptional()
  @IsIn(['REGISTERED', 'CHECKED_IN', 'NO_SHOW'])
  checkInStatus?: string;

  @IsString()
  @IsUUID()
  eventId!: string;

  @IsString()
  @IsUUID()
  ticketId!: string;
}
