import { IsString, MaxLength, IsOptional, IsIn } from 'class-validator';

export class CreateRegistrationDto {
  @IsString()
  @MaxLength(36)
  eventId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  userId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  attendeeId?: string;

  @IsOptional()
  @IsString()
  @IsIn(['PENDING', 'CONFIRMED', 'CANCELLED', 'WAITLISTED'])
  status?: string;
}
