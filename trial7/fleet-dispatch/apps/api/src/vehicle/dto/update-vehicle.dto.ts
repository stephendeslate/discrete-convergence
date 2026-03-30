import { IsString, MaxLength, IsInt, IsNumber, Min, IsOptional, IsIn } from 'class-validator';

// TRACED:FD-VEH-002
export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  licensePlate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  make?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  model?: string;

  @IsOptional()
  @IsInt()
  @Min(1900)
  year?: number;

  @IsOptional()
  @IsIn(['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'RETIRED'])
  @IsString()
  @MaxLength(20)
  status?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  mileage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fuelCostPerKm?: number;
}
