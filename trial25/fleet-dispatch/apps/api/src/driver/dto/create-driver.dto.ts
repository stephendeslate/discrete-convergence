// TRACED:FD-DRV-001 — Create driver DTO
import { IsString, IsEmail, MaxLength } from 'class-validator';

export class CreateDriverDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MaxLength(20)
  phone!: string;

  @IsString()
  @MaxLength(50)
  licenseNumber!: string;
}
