import { IsString, MaxLength, IsOptional, IsInt, Min, IsDecimal } from 'class-validator';

export class CreateRouteDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsString()
  @MaxLength(500)
  origin!: string;

  @IsString()
  @MaxLength(500)
  destination!: string;

  @IsOptional()
  @IsDecimal()
  distance?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  estimatedDuration?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  status?: string;
}
