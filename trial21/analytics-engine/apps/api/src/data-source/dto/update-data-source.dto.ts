import { IsString, MaxLength, IsOptional, IsObject } from 'class-validator';

export class UpdateDataSourceDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}
