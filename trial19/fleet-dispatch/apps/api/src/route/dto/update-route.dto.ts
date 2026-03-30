import { IsString, MaxLength, IsNumber, Min, IsInt, IsOptional } from 'class-validator';

export class UpdateRouteDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  origin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  destination?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  distance?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedDuration?: number;
}
