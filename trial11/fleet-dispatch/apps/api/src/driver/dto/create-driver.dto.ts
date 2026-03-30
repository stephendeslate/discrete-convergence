import { IsString, MaxLength, IsOptional, IsEnum } from 'class-validator';
import { DriverStatus } from '@prisma/client';

// TRACED: FD-SEC-009
export class CreateDriverDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @MaxLength(50)
  licenseNumber!: string;

  @IsString()
  @MaxLength(20)
  phone!: string;

  @IsOptional()
  @IsEnum(DriverStatus)
  status?: DriverStatus;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  userId?: string;
}
