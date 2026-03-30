import { IsString, MaxLength, IsNumber, Min, IsOptional, IsEnum } from 'class-validator';
import { MaintenanceType, MaintenanceStatus } from '@prisma/client';

export class UpdateMaintenanceDto {
  @IsOptional()
  @IsEnum(MaintenanceType)
  type?: MaintenanceType;

  @IsOptional()
  @IsEnum(MaintenanceStatus)
  status?: MaintenanceStatus;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  scheduledAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  completedAt?: string;
}
