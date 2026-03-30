import { IsString, MaxLength, IsEmail, IsOptional } from 'class-validator';

export class CreateAttendeeDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsEmail()
  @IsString()
  @MaxLength(255)
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}
