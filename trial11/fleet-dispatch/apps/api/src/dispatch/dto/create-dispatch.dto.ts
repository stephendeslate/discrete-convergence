import { IsString, MaxLength, IsOptional, IsEnum, IsNumber, Min, IsDateString } from 'class-validator';
import { DispatchStatus } from '@prisma/client';

// TRACED: FD-API-008
export class CreateDispatchDto {
  @IsString()
  @MaxLength(36)
  vehicleId!: string;

  @IsString()
  @MaxLength(36)
  driverId!: string;

  @IsString()
  @MaxLength(500)
  origin!: string;

  @IsString()
  @MaxLength(500)
  destination!: string;

  @IsOptional()
  @IsEnum(DispatchStatus)
  status?: DispatchStatus;

  @IsDateString()
  scheduledAt!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
