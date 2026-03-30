import { IsEmail, IsString, MaxLength, IsOptional } from 'class-validator';

export class UpdateAttendeeDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsEmail()
  @IsString()
  @MaxLength(255)
  email?: string;
}
