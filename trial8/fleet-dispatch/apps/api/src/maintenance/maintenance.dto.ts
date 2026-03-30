import { IsString, MaxLength, IsOptional, IsIn, IsNumber, IsDateString, Min } from 'class-validator';

export class CreateMaintenanceDto {
  @IsString()
  @MaxLength(36)
  vehicleId!: string;

  @IsString()
  @MaxLength(20)
  @IsIn(['SCHEDULED', 'UNSCHEDULED', 'EMERGENCY'])
  type!: string;

  @IsNumber()
  @Min(0)
  cost!: number;

  @IsDateString()
  @IsString()
  @MaxLength(50)
  date!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

export class UpdateMaintenanceDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @IsIn(['SCHEDULED', 'UNSCHEDULED', 'EMERGENCY'])
  type?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @IsOptional()
  @IsDateString()
  @IsString()
  @MaxLength(50)
  date?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
