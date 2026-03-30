import { IsString, MaxLength, IsOptional, IsInt, Min, IsIn } from 'class-validator';

const CONNECTOR_TYPES = ['REST_API', 'POSTGRESQL', 'CSV', 'WEBHOOK'] as const;

export class CreateDataSourceDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsIn(CONNECTOR_TYPES)
  type!: (typeof CONNECTOR_TYPES)[number];

  @IsString()
  @MaxLength(4096)
  configEncrypted!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  scheduleMinutes?: number;
}
