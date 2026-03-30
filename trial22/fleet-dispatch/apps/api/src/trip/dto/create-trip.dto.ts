import { IsString, MaxLength, IsOptional, IsDateString, IsIn } from 'class-validator';

export class CreateTripDto {
  @IsString()
  @MaxLength(36)
  routeId!: string;

  @IsString()
  @MaxLength(36)
  vehicleId!: string;

  @IsString()
  @MaxLength(36)
  driverId!: string;

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsString()
  @IsIn(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  status?: string;
}
