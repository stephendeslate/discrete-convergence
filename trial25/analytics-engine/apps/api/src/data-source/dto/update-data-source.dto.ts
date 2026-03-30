// TRACED:DS-DTO-UPDATE — Update data source DTO
import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

/**
 * TRACED:AE-DS-DTO-002 — Update data source DTO
 */
export class UpdateDataSourceDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  connectionString?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
