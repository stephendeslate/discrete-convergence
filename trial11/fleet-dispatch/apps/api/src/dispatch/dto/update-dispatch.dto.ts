import { IsString, MaxLength, IsOptional, IsEnum, IsNumber, Min, IsDateString } from 'class-validator';
import { DispatchStatus } from '@prisma/client';

export class UpdateDispatchDto {
  @IsOptional()
  @IsString()
  @MaxLength(36)
  vehicleId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  driverId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  origin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  destination?: string;

  @IsOptional()
  @IsEnum(DispatchStatus)
  status?: DispatchStatus;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
