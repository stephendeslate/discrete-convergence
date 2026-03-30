import { IsString, MaxLength, IsOptional, IsIn, IsDateString } from 'class-validator';

export class CreateTripDto {
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
  @IsDateString()
  @IsString()
  @MaxLength(50)
  startTime?: string;
}

export class UpdateTripDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @IsIn(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  status?: string;

  @IsOptional()
  @IsDateString()
  @IsString()
  @MaxLength(50)
  startTime?: string;

  @IsOptional()
  @IsDateString()
  @IsString()
  @MaxLength(50)
  endTime?: string;
}
