import { IsString, MaxLength, IsInt, IsOptional, IsIn, Min, IsNumber } from 'class-validator';

// TRACED: FD-VEH-001
export class CreateVehicleDto {
  @IsString()
  @MaxLength(20)
  licensePlate!: string;

  @IsString()
  @MaxLength(50)
  make!: string;

  @IsString()
  @MaxLength(50)
  model!: string;

  @IsInt()
  @Min(1900)
  year!: number;

  @IsOptional()
  @IsIn(['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'RETIRED'])
  @IsString()
  @MaxLength(20)
  status?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  mileage?: number;

  @IsNumber()
  fuelCapacity!: number;

  @IsNumber()
  costPerMile!: number;
}
