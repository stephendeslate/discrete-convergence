import { IsString, MaxLength, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { VehicleStatus } from '@prisma/client';

// TRACED: FD-SEC-008
export class CreateVehicleDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @MaxLength(20)
  licensePlate!: string;

  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  mileage?: number;
}
