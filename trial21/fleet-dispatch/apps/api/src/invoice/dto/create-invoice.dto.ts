import {
  IsArray,
  ValidateNested,
  IsString,
  IsNumber,
  IsEnum,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LineItemType } from '@prisma/client';

export class LineItemDto {
  @IsEnum(LineItemType)
  type!: LineItemType;

  @IsString()
  @MinLength(1)
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
