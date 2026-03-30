import { IsString, MaxLength, IsOptional, IsIn, IsDateString, IsNumber } from 'class-validator';

// TRACED: FD-MNT-001
export class CreateMaintenanceDto {
  @IsString()
  @MaxLength(500)
  description!: string;

  @IsOptional()
  @IsIn(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  @IsString()
  @MaxLength(20)
  status?: string;

  @IsDateString()
  @MaxLength(50)
  scheduledAt!: string;

  @IsOptional()
  @IsNumber()
  cost?: number;

  @IsString()
  @MaxLength(36)
  vehicleId!: string;
}
