// TRACED: FD-API-004 — Create dispatch job DTO with validation
import { IsString, IsOptional, IsDateString, MaxLength } from 'class-validator';

export class CreateDispatchJobDto {
  @IsString()
  @MaxLength(255)
  origin!: string;

  @IsString()
  @MaxLength(255)
  destination!: string;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  vehicleId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  driverId?: string;

  @IsOptional()
  @IsDateString()
  @MaxLength(30)
  scheduledAt?: string;
}
