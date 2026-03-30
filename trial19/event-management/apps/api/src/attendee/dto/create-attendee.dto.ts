import { IsEmail, IsString, MaxLength } from 'class-validator';

export class CreateAttendeeDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsEmail()
  @IsString()
  @MaxLength(255)
  email!: string;
}
