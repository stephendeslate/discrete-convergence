// TRACED:DATASOURCE-DTO — Validation DTOs for data source CRUD
import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateDataSourceDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @MaxLength(50)
  type!: string;

  @IsString()
  connectionString!: string;
}

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
  connectionString?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
