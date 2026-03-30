import { IsString, MaxLength, IsOptional, IsIn, IsDateString } from 'class-validator';

// TRACED: FD-DSP-001
export class CreateDispatchDto {
  @IsDateString()
  @MaxLength(50)
  scheduledAt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @IsString()
  @MaxLength(36)
  vehicleId!: string;

  @IsString()
  @MaxLength(36)
  driverId!: string;

  @IsString()
  @MaxLength(36)
  routeId!: string;

  @IsOptional()
  @IsIn(['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  @IsString()
  @MaxLength(20)
  status?: string;
}
