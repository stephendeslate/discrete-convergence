import { IsString, MaxLength, IsOptional, IsInt, Min } from 'class-validator';

export class UpdateDataSourceDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4096)
  configEncrypted?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  scheduleMinutes?: number;
}
