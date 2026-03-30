// TRACED:API-TRIP-DTO
import { IsUUID, IsDateString, IsOptional, IsNumber, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTripDto {
  @IsUUID()
  dispatchId!: string;

  @IsDateString()
  startedAt!: string;

  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  distanceKm?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  fuelUsedLiters?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateTripDto {
  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  distanceKm?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  fuelUsedLiters?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
