import { IsString, MaxLength, IsInt, Min, Max, IsOptional, IsNumber } from 'class-validator';

export class CreateVehicleDto {
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
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  mileage?: number;
}
