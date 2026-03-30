import { IsString, MaxLength, IsNumber, Min, IsDateString, IsIn } from 'class-validator';

// TRACED:FD-MNT-001
export class CreateMaintenanceDto {
  @IsString()
  @MaxLength(36)
  tenantId!: string;

  @IsString()
  @MaxLength(36)
  vehicleId!: string;

  @IsIn(['PREVENTIVE', 'CORRECTIVE', 'EMERGENCY'])
  @IsString()
  @MaxLength(20)
  type!: string;

  @IsString()
  @MaxLength(2000)
  description!: string;

  @IsNumber()
  @Min(0)
  cost!: number;

  @IsDateString()
  performedAt!: string;
}
