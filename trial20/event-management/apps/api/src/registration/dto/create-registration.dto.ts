import { IsString, MaxLength, IsOptional, IsEnum } from 'class-validator';

export class CreateRegistrationDto {
  @IsString()
  @MaxLength(36)
  eventId!: string;

  @IsString()
  @MaxLength(36)
  attendeeId!: string;
}

export class UpdateRegistrationDto {
  @IsOptional()
  @IsEnum(['PENDING', 'CONFIRMED', 'CANCELLED', 'WAITLISTED'])
  status?: string;
}
