import { IsString, MaxLength, IsOptional, IsInt, Min, Max, IsDateString, IsDecimal } from 'class-validator';

export class UpdateDispatchDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  status?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  priority?: number;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @IsOptional()
  @IsDecimal()
  estimatedCost?: string;

  @IsOptional()
  @IsDecimal()
  actualCost?: string;

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
  @MaxLength(36)
  routeId?: string;
}
