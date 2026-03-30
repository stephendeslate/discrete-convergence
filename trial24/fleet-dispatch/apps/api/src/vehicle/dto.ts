// TRACED:API-VEHICLE-DTO
import { IsString, IsInt, Min, Max, IsOptional, IsEnum } from 'class-validator';

export enum VehicleStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
}

export class CreateVehicleDto {
  @IsString()
  vin!: string;

  @IsString()
  make!: string;

  @IsString()
  model!: string;

  @IsInt()
  @Min(1900)
  @Max(2030)
  year!: number;

  @IsString()
  licensePlate!: string;

  @IsOptional()
  @IsEnum(VehicleStatusEnum)
  status?: VehicleStatusEnum;
}

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  vin?: string;

  @IsOptional()
  @IsString()
  make?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2030)
  year?: number;

  @IsOptional()
  @IsString()
  licensePlate?: string;

  @IsOptional()
  @IsEnum(VehicleStatusEnum)
  status?: VehicleStatusEnum;
}
