// TRACED:FD-AUT-004 — Registration DTO with validation decorators
import { IsEmail, IsString, MaxLength, IsIn, IsOptional } from 'class-validator';
import { ALLOWED_REGISTRATION_ROLES } from '@fleet-dispatch/shared';

export class RegisterDto {
  @IsEmail()
  @IsString()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MaxLength(128)
  password!: string;

  @IsIn([...ALLOWED_REGISTRATION_ROLES])
  role!: 'DISPATCHER' | 'TECHNICIAN' | 'CUSTOMER';

  @IsOptional()
  @IsString()
  @MaxLength(36)
  companyId?: string;
}
