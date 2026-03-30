import { IsString, IsNotEmpty, MaxLength, IsInt, IsOptional, IsIn, Min } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(17)
  vin!: string;

  @IsString()
  @MaxLength(100)
  make!: string;

  @IsString()
  @MaxLength(100)
  model!: string;

  @IsInt()
  @Min(1900)
  year!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  mileage?: number;
}

export class UpdateVehicleDto {
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
  @IsString()
  @MaxLength(20)
  @IsIn(['ACTIVE', 'MAINTENANCE', 'RETIRED'])
  status?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  mileage?: number;
}
