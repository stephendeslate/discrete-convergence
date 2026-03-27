// TRACED: FD-API-008 — Create maintenance log DTO with validation
import { IsString, IsOptional, IsNumber, Min, IsDateString, MaxLength } from 'class-validator';

export class CreateMaintenanceDto {
  @IsString()
  @MaxLength(100)
  type!: string;

  @IsString()
  @MaxLength(1000)
  description!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @IsOptional()
  @IsDateString()
  @MaxLength(30)
  performedAt?: string;
}
