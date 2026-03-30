// TRACED: EM-DATA-003
import { IsString, MaxLength, IsOptional, IsEnum } from 'class-validator';

export class CreateRegistrationDto {
  @IsString()
  @MaxLength(36)
  eventId!: string;

  @IsString()
  @MaxLength(36)
  attendeeId!: string;

  @IsOptional()
  @IsEnum(['PENDING', 'CONFIRMED', 'CANCELLED'])
  @IsString()
  @MaxLength(20)
  status?: string;
}
