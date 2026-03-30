import { IsString, MaxLength, IsNumber, Min, IsEnum } from 'class-validator';
import { MaintenanceType } from '@prisma/client';

export class CreateMaintenanceDto {
  @IsEnum(MaintenanceType)
  type!: MaintenanceType;

  @IsString()
  @MaxLength(1000)
  description!: string;

  @IsNumber()
  @Min(0)
  cost!: number;

  @IsString()
  @MaxLength(36)
  vehicleId!: string;

  @IsString()
  @MaxLength(30)
  scheduledAt!: string;
}
