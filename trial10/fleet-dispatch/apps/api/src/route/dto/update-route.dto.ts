import { IsString, MaxLength, IsInt, IsNumber, Min, IsOptional, IsEnum } from 'class-validator';
import { RouteStatus } from '@prisma/client';

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
  distanceKm?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedTime?: number;

  @IsOptional()
  @IsEnum(RouteStatus)
  status?: RouteStatus;
}
