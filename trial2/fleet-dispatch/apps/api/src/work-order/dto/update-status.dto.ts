import { IsString, IsIn } from 'class-validator';
import { WorkOrderStatus } from '@prisma/client';

export class UpdateStatusDto {
  @IsString()
  @IsIn(Object.values(WorkOrderStatus))
  status!: WorkOrderStatus;
}
