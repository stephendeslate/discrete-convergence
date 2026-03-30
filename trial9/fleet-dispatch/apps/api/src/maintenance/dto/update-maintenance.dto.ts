import { IsString, MaxLength, IsOptional, IsIn, IsDateString, IsNumber } from 'class-validator';

export class UpdateMaintenanceDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsIn(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  @IsString()
  @MaxLength(20)
  status?: string;

  @IsOptional()
  @IsDateString()
  @MaxLength(50)
  scheduledAt?: string;

  @IsOptional()
  @IsDateString()
  @MaxLength(50)
  completedAt?: string;

  @IsOptional()
  @IsNumber()
  cost?: number;
}
