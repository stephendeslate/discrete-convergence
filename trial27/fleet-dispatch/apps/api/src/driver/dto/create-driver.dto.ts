// TRACED: FD-API-003 — Create driver DTO with validation
import { IsString, IsEmail, MaxLength } from 'class-validator';

export class CreateDriverDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MaxLength(50)
  licenseNumber!: string;
}
