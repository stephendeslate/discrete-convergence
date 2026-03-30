import { IsString, MaxLength, IsNumber, Min, IsInt, IsOptional, IsArray } from 'class-validator';

export class CreateRouteDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @MaxLength(500)
  origin!: string;

  @IsString()
  @MaxLength(500)
  destination!: string;

  @IsOptional()
  @IsArray()
  waypoints?: unknown[];

  @IsNumber()
  @Min(0)
  distanceKm!: number;

  @IsInt()
  @Min(1)
  estimatedMinutes!: number;
}
