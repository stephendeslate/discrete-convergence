// TRACED:API-MAINTENANCE-DTO
import { IsUUID, IsEnum, IsString, IsDateString, IsOptional, IsNumber, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export enum MaintenanceTypeEnum {
  ROUTINE = 'ROUTINE',
  REPAIR = 'REPAIR',
  INSPECTION = 'INSPECTION',
}

export class CreateMaintenanceDto {
  @IsUUID()
  vehicleId!: string;

  @IsEnum(MaintenanceTypeEnum)
  type!: MaintenanceTypeEnum;

  @IsString()
  @MinLength(1)
  description!: string;

  @IsDateString()
  scheduledDate!: string;

  @IsOptional()
  @IsDateString()
  completedDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cost?: number;
}

export class UpdateMaintenanceDto {
  @IsOptional()
  @IsEnum(MaintenanceTypeEnum)
  type?: MaintenanceTypeEnum;

  @IsOptional()
  @IsString()
  @MinLength(1)
  description?: string;

  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @IsOptional()
  @IsDateString()
  completedDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cost?: number;
}
