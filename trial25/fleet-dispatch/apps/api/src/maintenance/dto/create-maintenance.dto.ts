// TRACED:FD-MNT-001 — Create maintenance DTO
import { IsString, IsEnum, IsDateString, IsOptional, IsNumber, Min, MaxLength } from 'class-validator';

export enum MaintenanceTypeEnum {
  SCHEDULED = 'SCHEDULED',
  EMERGENCY = 'EMERGENCY',
  INSPECTION = 'INSPECTION',
}

export class CreateMaintenanceDto {
  @IsString()
  @MaxLength(36)
  vehicleId!: string;

  @IsEnum(MaintenanceTypeEnum)
  type!: MaintenanceTypeEnum;

  @IsString()
  @MaxLength(1000)
  description!: string;

  @IsDateString()
  scheduledDate!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;
}
