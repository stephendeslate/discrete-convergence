// TRACED: EM-SEC-002 — Register DTO with validation
// TRACED: EM-EDGE-001 — Malformed input validation
// TRACED: EM-EDGE-002 — Missing required fields returns 400 via @IsNotEmpty decorators
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(36)
  tenantId!: string;
  // Role field intentionally removed — registration always assigns MEMBER role
}
