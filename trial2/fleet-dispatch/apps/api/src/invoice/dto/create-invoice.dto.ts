import { IsArray, IsString, MaxLength, IsNumber, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { LineItemType } from '@prisma/client';

export class LineItemDto {
  @IsString()
  @IsIn(['LABOR', 'MATERIAL', 'FLAT_RATE', 'DISCOUNT', 'TAX'])
  type!: LineItemType;

  @IsString()
  @MaxLength(255)
  description!: string;

  @IsNumber()
  quantity!: number;

  @IsNumber()
  unitPrice!: number;
}

export class CreateInvoiceDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LineItemDto)
  lineItems!: LineItemDto[];
}
