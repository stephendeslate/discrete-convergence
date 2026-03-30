import { IsString, MaxLength, IsInt, Min, Max, IsOptional, IsIn } from 'class-validator';

// TRACED: FD-EDGE-005
export class CreateVehicleDto {
  @IsString()
  @MaxLength(17)
  vin!: string;

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

  @IsOptional()
  @IsInt()
  @Min(0)
  mileage?: number;

  @IsOptional()
  @IsString()
  @IsIn(['ACTIVE', 'MAINTENANCE', 'INACTIVE', 'RETIRED'])
  status?: string;
}
