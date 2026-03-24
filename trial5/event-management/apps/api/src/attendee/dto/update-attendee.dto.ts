import { IsString, IsOptional, IsEmail, IsIn, MaxLength } from 'class-validator';

export class UpdateAttendeeDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsIn(['REGISTERED', 'CHECKED_IN', 'NO_SHOW'])
  checkInStatus?: string;
}
