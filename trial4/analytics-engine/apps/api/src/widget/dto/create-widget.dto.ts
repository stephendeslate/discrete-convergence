import { IsString, MaxLength, IsObject, IsOptional, IsIn } from 'class-validator';
import type { Prisma } from '@prisma/client';

const WIDGET_TYPES = [
  'LINE_CHART',
  'BAR_CHART',
  'PIE_CHART',
  'AREA_CHART',
  'KPI_CARD',
  'TABLE',
  'FUNNEL',
] as const;

export class CreateWidgetDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsIn(WIDGET_TYPES)
  type!: (typeof WIDGET_TYPES)[number];

  @IsObject()
  config!: Prisma.InputJsonValue;

  @IsObject()
  position!: Prisma.InputJsonValue;

  @IsString()
  @MaxLength(36)
  dashboardId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  dataSourceId?: string;
}
