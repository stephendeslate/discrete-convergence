// TRACED:FD-VEH-002 — Update vehicle DTO
import { IsString, IsEnum, IsInt, Min, Max, MaxLength, IsOptional } from 'class-validator';
import { VehicleTypeEnum } from './create-vehicle.dto';

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  plateNumber?: string;

  @IsOptional()
  @IsEnum(VehicleTypeEnum)
  type?: VehicleTypeEnum;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  capacity?: number;
}
