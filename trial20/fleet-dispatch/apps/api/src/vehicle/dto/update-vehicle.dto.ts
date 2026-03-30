import { IsString, MaxLength, IsInt, Min, Max, IsOptional, IsEnum, IsNumber } from 'class-validator';

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

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
  @Max(2100)
  year?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  mileage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costPerMile?: number;

  @IsOptional()
  @IsEnum(['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'RETIRED'])
  @IsString()
  @MaxLength(20)
  status?: string;
}
