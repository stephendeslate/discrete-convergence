import { IsEmail, IsString, MaxLength, IsIn, IsOptional } from 'class-validator';
import { DRIVER_STATUSES } from '@fleet-dispatch/shared';

export class UpdateDriverDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsEmail()
  @IsString()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  licenseNumber?: string;

  @IsOptional()
  @IsIn([...DRIVER_STATUSES])
  @IsString()
  @MaxLength(20)
  status?: string;
}
