// TRACED:API-DRIVER-DTO
import { IsString, IsEmail, IsOptional, IsEnum, MinLength } from 'class-validator';

export enum DriverStatusEnum {
  AVAILABLE = 'AVAILABLE',
  ON_TRIP = 'ON_TRIP',
  OFF_DUTY = 'OFF_DUTY',
}

export class CreateDriverDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  licenseNumber!: string;

  @IsOptional()
  @IsEnum(DriverStatusEnum)
  status?: DriverStatusEnum;
}

export class UpdateDriverDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  licenseNumber?: string;

  @IsOptional()
  @IsEnum(DriverStatusEnum)
  status?: DriverStatusEnum;
}
