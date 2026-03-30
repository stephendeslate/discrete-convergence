import { IsString, MaxLength, IsInt, IsNumber, Min } from 'class-validator';

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

  @IsNumber()
  @Min(0)
  distanceKm!: number;

  @IsInt()
  @Min(1)
  estimatedTime!: number;
}
