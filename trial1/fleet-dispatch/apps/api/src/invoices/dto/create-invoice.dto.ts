import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LineItemDto {
  @IsString()
  description!: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @IsString()
  unitPrice!: string;
}

export class CreateInvoiceDto {
  @IsString()
  subtotal!: string;

  @IsOptional()
  @IsString()
  tax?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsString()
  workOrderId!: string;

  @IsString()
  customerId!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LineItemDto)
  lineItems?: LineItemDto[];
}
