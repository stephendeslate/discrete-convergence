import { IsString, MaxLength } from 'class-validator';

// TRACED: EM-ATTEND-001
export class CreateAttendeeDto {
  @IsString()
  @MaxLength(36)
  eventId!: string;

  @IsString()
  @MaxLength(36)
  userId!: string;
}
