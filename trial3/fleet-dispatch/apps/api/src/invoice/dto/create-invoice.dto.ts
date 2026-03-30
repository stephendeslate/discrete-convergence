import {
  IsString,
  IsArray,
  MaxLength,
  ValidateNested,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

enum LineItemType {
  LABOR = 'LABOR',
  MATERIAL = 'MATERIAL',
  FLAT_RATE = 'FLAT_RATE',
  DISCOUNT = 'DISCOUNT',
  TAX = 'TAX',
}

export class CreateLineItemDto {
  @IsEnum(LineItemType)
  type!: LineItemType;

  @IsString()
  @MaxLength(500)
  description!: string;

  @IsNumber()
  quantity!: number;

  @IsNumber()
  unitPrice!: number;
}

export class CreateInvoiceDto {
  @IsString()
  @MaxLength(36)
  workOrderId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLineItemDto)
  lineItems!: CreateLineItemDto[];
}
