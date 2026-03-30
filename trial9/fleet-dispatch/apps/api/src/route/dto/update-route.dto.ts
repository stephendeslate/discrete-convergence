import { IsString, MaxLength, IsInt, IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateRouteDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  origin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  destination?: string;

  @IsOptional()
  @IsNumber()
  distanceMiles?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedTime?: number;
}
