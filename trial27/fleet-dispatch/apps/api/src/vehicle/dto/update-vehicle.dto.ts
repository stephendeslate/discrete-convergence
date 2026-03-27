// TRACED: FD-API-002 — Update vehicle DTO with validation
import { IsString, IsEnum, IsOptional, IsInt, Min, MaxLength } from 'class-validator';
import { VehicleType, VehicleStatus } from '@fleet-dispatch/shared';

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  licensePlate?: string;

  @IsOptional()
  @IsEnum(VehicleType)
  @MaxLength(20)
  type?: VehicleType;

  @IsOptional()
  @IsEnum(VehicleStatus)
  @MaxLength(20)
  status?: VehicleStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  mileage?: number;
}
