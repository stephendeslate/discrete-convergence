import { IsString, MaxLength, IsOptional, IsIn } from 'class-validator';

export class CreateRegistrationDto {
  @IsString()
  @MaxLength(36)
  eventId!: string;

  @IsString()
  @MaxLength(36)
  attendeeId!: string;

  @IsOptional()
  @IsString()
  @IsIn(['PENDING', 'CONFIRMED', 'CANCELLED'])
  status?: string;
}
