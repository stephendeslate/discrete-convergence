// TRACED:AUTH-DTO-REGISTER — Register DTO
// TRACED:AUTH-DTO-MAXLENGTH — @MaxLength on email(255), password(128), tenantId(36) (VERIFY:AUTH-DTO-MAXLENGTH)
// TRACED:SEC-MAXLENGTH — all DTO strings have @MaxLength decorators (VERIFY:SEC-MAXLENGTH)
import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

/**
 * TRACED:AE-AUTH-DTO-001 — Register DTO with validation
 */
export class RegisterDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  tenantId?: string;
}
