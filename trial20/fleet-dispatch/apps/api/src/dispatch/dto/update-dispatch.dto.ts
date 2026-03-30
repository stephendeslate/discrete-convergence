import { IsString, MaxLength, IsOptional, IsEnum, IsDateString, IsNumber, Min } from 'class-validator';

export class UpdateDispatchDto {
  @IsOptional()
  @IsString()
  @MaxLength(36)
  vehicleId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  routeId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  driverId?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @IsOptional()
  @IsEnum(['PENDING', 'ASSIGNED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'])
  @IsString()
  @MaxLength(20)
  status?: string;
}
