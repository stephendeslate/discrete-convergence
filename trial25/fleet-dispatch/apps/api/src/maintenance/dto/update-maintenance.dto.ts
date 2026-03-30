// TRACED:FD-MNT-002 — Update maintenance DTO
import { IsString, IsEnum, IsDateString, IsOptional, IsNumber, Min, MaxLength } from 'class-validator';
import { MaintenanceTypeEnum } from './create-maintenance.dto';

export class UpdateMaintenanceDto {
  @IsOptional()
  @IsEnum(MaintenanceTypeEnum)
  type?: MaintenanceTypeEnum;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;
}
