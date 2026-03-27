// TRACED: EM-SEC-002 — Login DTO with validation
// TRACED: EM-EDGE-001 — Malformed input validation
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  password!: string;
}
