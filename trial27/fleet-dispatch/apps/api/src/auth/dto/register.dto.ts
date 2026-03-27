// TRACED: FD-AUTH-001 — Register DTO with validation
// TRACED: FD-EDGE-003 — Empty/missing body fields return 400 via class-validator decorators
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  organizationName!: string;
}
