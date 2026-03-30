import { IsString, IsOptional } from 'class-validator';

export class CreateDataSourceDto {
  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsOptional()
  config?: Record<string, unknown>;
}
