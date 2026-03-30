// TRACED:FD-VEH-001 — Create vehicle DTO
import { IsString, IsEnum, IsInt, Min, Max, MaxLength } from 'class-validator';

export enum VehicleTypeEnum {
  TRUCK = 'TRUCK',
  VAN = 'VAN',
  CAR = 'CAR',
  MOTORCYCLE = 'MOTORCYCLE',
}

export class CreateVehicleDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @MaxLength(20)
  plateNumber!: string;

  @IsEnum(VehicleTypeEnum)
  type!: VehicleTypeEnum;

  @IsInt()
  @Min(1)
  @Max(100)
  capacity!: number;
}
