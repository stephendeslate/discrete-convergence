import { IsString, MaxLength, IsInt, Min, Max, IsIn, IsOptional } from 'class-validator';
import { VEHICLE_STATUSES } from '@fleet-dispatch/shared';

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  licensePlate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  make?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  model?: string;

  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  year?: number;

  @IsOptional()
  @IsIn([...VEHICLE_STATUSES])
  @IsString()
  @MaxLength(20)
  status?: string;
}
