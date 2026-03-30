import { IsString, MaxLength, IsInt, Min, Max, IsOptional, IsEnum, IsNumber } from 'class-validator';

// TRACED: FD-VEH-001
export class CreateVehicleDto {
  @IsString()
  @MaxLength(255)
  name!: string;

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
  @Max(2100)
  year!: number;

  @IsNumber()
  @Min(0)
  mileage!: number;

  @IsNumber()
  @Min(0)
  costPerMile!: number;

  @IsOptional()
  @IsEnum(['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'RETIRED'])
  @IsString()
  @MaxLength(20)
  status?: string;
}
