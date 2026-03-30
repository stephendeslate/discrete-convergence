import { IsIn } from 'class-validator';
import { INVOICE_STATUSES } from '@fleet-dispatch/shared';

export class UpdateInvoiceStatusDto {
  @IsIn([...INVOICE_STATUSES])
  status!: 'DRAFT' | 'SENT' | 'PAID' | 'VOID';
}
