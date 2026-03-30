import { IsArray, ValidateNested, IsString, MaxLength, IsNumber, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

class LineItemDto {
  @IsIn(['LABOR', 'MATERIAL', 'FLAT', 'DISCOUNT', 'TAX'])
  type!: 'LABOR' | 'MATERIAL' | 'FLAT' | 'DISCOUNT' | 'TAX';

  @IsString()
  @MaxLength(500)
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
