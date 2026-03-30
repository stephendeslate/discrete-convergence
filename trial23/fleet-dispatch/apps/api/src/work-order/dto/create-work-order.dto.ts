import { IsString, IsOptional, IsUUID, IsIn, IsDateString } from 'class-validator';
import { WORK_ORDER_STATUSES } from '@repo/shared';

export class CreateWorkOrderDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn([...WORK_ORDER_STATUSES])
  status?: string;

  @IsOptional()
  @IsUUID()
  technicianId?: string;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsString()
  priority?: string;
}
