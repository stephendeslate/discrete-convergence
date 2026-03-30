import { IsString, MaxLength, IsInt, Min, IsOptional, IsEnum, IsNumber } from 'class-validator';

export class UpdateRouteDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  origin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  destination?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  distance?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedTime?: number;

  @IsOptional()
  @IsEnum(['DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED'])
  @IsString()
  @MaxLength(20)
  status?: string;
}
