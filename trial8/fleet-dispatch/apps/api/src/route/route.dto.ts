import { IsString, MaxLength, IsNumber, IsOptional, IsInt, Min } from 'class-validator';

export class CreateRouteDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsString()
  @MaxLength(500)
  origin!: string;

  @IsString()
  @MaxLength(500)
  destination!: string;

  @IsNumber()
  @Min(0)
  distance!: number;

  @IsInt()
  @Min(1)
  estimatedDuration!: number;
}

export class UpdateRouteDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
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
  estimatedDuration?: number;
}
