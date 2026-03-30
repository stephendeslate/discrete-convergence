import { IsString, MaxLength, IsInt, IsNumber, Min } from 'class-validator';

// TRACED:FD-VEH-001
export class CreateVehicleDto {
  @IsString()
  @MaxLength(36)
  tenantId!: string;

  @IsString()
  @MaxLength(20)
  licensePlate!: string;

  @IsString()
  @MaxLength(100)
  make!: string;

  @IsString()
  @MaxLength(100)
  model!: string;

  @IsInt()
  @Min(1900)
  year!: number;

  @IsNumber()
  @Min(0)
  mileage!: number;

  @IsNumber()
  @Min(0)
  fuelCostPerKm!: number;
}
