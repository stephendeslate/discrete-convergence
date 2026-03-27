// TRACED: FD-API-003 — Update driver DTO with validation
import { IsString, IsEmail, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { DriverStatus } from '@fleet-dispatch/shared';

export class UpdateDriverDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  licenseNumber?: string;

  @IsOptional()
  @IsEnum(DriverStatus)
  @MaxLength(20)
  status?: DriverStatus;
}
