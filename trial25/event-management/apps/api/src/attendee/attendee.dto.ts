// TRACED:EM-ATT-001 TRACED:EM-ATT-004
import { IsString, IsOptional, IsEmail, IsUUID, MaxLength } from 'class-validator';

export class CreateAttendeeDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsUUID()
  @MaxLength(36)
  eventId!: string;
}
