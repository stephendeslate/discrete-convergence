import { IsString, MaxLength, IsObject, IsOptional } from 'class-validator';
import type { Prisma } from '@prisma/client';

export class UpdateWidgetDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsObject()
  config?: Prisma.InputJsonValue;

  @IsOptional()
  @IsObject()
  position?: Prisma.InputJsonValue;
}
