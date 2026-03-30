// TRACED:API-DISPATCH-DTO
import { IsUUID, IsOptional, IsEnum, IsDateString } from 'class-validator';

export enum DispatchStatusEnum {
  PENDING = 'PENDING',
  DISPATCHED = 'DISPATCHED',
  IN_TRANSIT = 'IN_TRANSIT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class CreateDispatchDto {
  @IsUUID()
  vehicleId!: string;

  @IsUUID()
  driverId!: string;

  @IsUUID()
  routeId!: string;

  @IsDateString()
  scheduledAt!: string;

  @IsOptional()
  @IsEnum(DispatchStatusEnum)
  status?: DispatchStatusEnum;
}

export class UpdateDispatchDto {
  @IsOptional()
  @IsUUID()
  vehicleId?: string;

  @IsOptional()
  @IsUUID()
  driverId?: string;

  @IsOptional()
  @IsUUID()
  routeId?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsEnum(DispatchStatusEnum)
  status?: DispatchStatusEnum;
}
