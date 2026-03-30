import { IsString, MaxLength, IsDateString, IsIn, IsOptional } from 'class-validator';
import { DISPATCH_STATUSES } from '@fleet-dispatch/shared';

export class UpdateDispatchDto {
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

  @IsOptional()
  @IsIn([...DISPATCH_STATUSES])
  @IsString()
  @MaxLength(20)
  status?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}
