// TRACED:API-ROUTE-DTO
import { IsString, IsNumber, IsOptional, IsInt, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRouteDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(1)
  origin!: string;

  @IsString()
  @MinLength(1)
  destination!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  distanceKm!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  estimatedMinutes!: number;
}

export class UpdateRouteDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  origin?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  destination?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  distanceKm?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  estimatedMinutes?: number;
}
