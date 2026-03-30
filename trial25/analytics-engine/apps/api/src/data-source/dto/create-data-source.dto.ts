// TRACED:DS-DTO-CREATE — Create data source DTO
import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

/**
 * TRACED:AE-DS-DTO-001 — Create data source DTO
 */
export class CreateDataSourceDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @MaxLength(50)
  type!: string;

  @IsString()
  @MaxLength(2048)
  connectionString!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
