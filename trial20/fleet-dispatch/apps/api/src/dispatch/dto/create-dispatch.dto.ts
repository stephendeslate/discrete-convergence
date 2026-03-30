import { IsString, MaxLength, IsOptional, IsEnum, IsDateString } from 'class-validator';

// TRACED: FD-DISP-001
export class CreateDispatchDto {
  @IsString()
  @MaxLength(36)
  vehicleId!: string;

  @IsString()
  @MaxLength(36)
  routeId!: string;

  @IsString()
  @MaxLength(36)
  driverId!: string;

  @IsDateString()
  scheduledAt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @IsOptional()
  @IsEnum(['PENDING', 'ASSIGNED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'])
  @IsString()
  @MaxLength(20)
  status?: string;
}
