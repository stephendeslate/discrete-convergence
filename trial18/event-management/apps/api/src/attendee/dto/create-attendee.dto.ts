import { IsString, MaxLength, IsOptional, IsEmail } from 'class-validator';

export class CreateAttendeeDto {
  @IsString()
  @MaxLength(100)
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
