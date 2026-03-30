import { IsString, MaxLength, IsDateString, IsOptional } from 'class-validator';

// TRACED:FD-DSP-001
export class CreateDispatchDto {
  @IsString()
  @MaxLength(36)
  tenantId!: string;

  @IsString()
  @MaxLength(36)
  vehicleId!: string;

  @IsString()
  @MaxLength(36)
  driverId!: string;

  @IsString()
  @MaxLength(36)
  routeId!: string;

  @IsDateString()
  scheduledAt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
