import { IsString, MaxLength, IsOptional, IsEmail } from 'class-validator';

export class CreateAttendeeDto {
  @IsEmail()
  @IsString()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;
}
