import { IsString, MaxLength, IsNumber, Min, IsDateString, IsOptional, IsIn } from 'class-validator';

// TRACED:FD-MNT-002
export class UpdateMaintenanceDto {
  @IsOptional()
  @IsIn(['PREVENTIVE', 'CORRECTIVE', 'EMERGENCY'])
  @IsString()
  @MaxLength(20)
  type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @IsOptional()
  @IsDateString()
  performedAt?: string;
}
