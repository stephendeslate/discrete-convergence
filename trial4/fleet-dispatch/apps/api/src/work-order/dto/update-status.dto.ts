import { IsIn } from 'class-validator';
import { WORK_ORDER_STATUSES } from '@fleet-dispatch/shared';

export class UpdateStatusDto {
  @IsIn([...WORK_ORDER_STATUSES])
  status!: 'UNASSIGNED' | 'ASSIGNED' | 'EN_ROUTE' | 'ON_SITE' | 'IN_PROGRESS' | 'COMPLETED' | 'INVOICED' | 'PAID' | 'CANCELLED';
}
