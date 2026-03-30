import { IsString, MaxLength, IsDateString, IsIn } from 'class-validator';
import { DISPATCH_STATUSES } from '@fleet-dispatch/shared';

export class CreateDispatchDto {
  @IsString()
  @MaxLength(36)
  vehicleId!: string;

  @IsString()
  @MaxLength(36)
  driverId!: string;

  @IsString()
  @MaxLength(36)
  routeId!: string;

  @IsIn([...DISPATCH_STATUSES])
  @IsString()
  @MaxLength(20)
  status!: string;

  @IsDateString()
  scheduledAt!: string;
}
