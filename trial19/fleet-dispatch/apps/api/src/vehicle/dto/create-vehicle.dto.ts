import { IsString, MaxLength, IsInt, Min, Max, IsIn } from 'class-validator';
import { VEHICLE_STATUSES } from '@fleet-dispatch/shared';

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
  @Max(2100)
  year!: number;

  @IsIn([...VEHICLE_STATUSES])
  @IsString()
  @MaxLength(20)
  status!: string;
}
