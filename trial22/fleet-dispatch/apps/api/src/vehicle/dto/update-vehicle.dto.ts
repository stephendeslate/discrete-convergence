import { IsString, MaxLength, IsInt, Min, Max, IsOptional, IsIn } from 'class-validator';

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  @MaxLength(17)
  vin?: string;

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
  @IsString()
  @IsIn(['ACTIVE', 'MAINTENANCE', 'INACTIVE', 'RETIRED'])
  status?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  mileage?: number;
}
