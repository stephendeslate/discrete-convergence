// TRACED: FD-API-002 — Create vehicle DTO with validation
import { IsString, IsEnum, IsOptional, IsInt, Min, MaxLength } from 'class-validator';
import { VehicleType } from '@fleet-dispatch/shared';

export class CreateVehicleDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsString()
  @MaxLength(20)
  licensePlate!: string;

  @IsOptional()
  @IsEnum(VehicleType)
  @MaxLength(20)
  type?: VehicleType;

  @IsOptional()
  @IsInt()
  @Min(0)
  mileage?: number;
}
