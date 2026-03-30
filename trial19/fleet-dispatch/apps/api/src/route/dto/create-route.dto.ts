import { IsString, MaxLength, IsNumber, Min, IsInt } from 'class-validator';

export class CreateRouteDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsString()
  @MaxLength(200)
  origin!: string;

  @IsString()
  @MaxLength(200)
  destination!: string;

  @IsNumber()
  @Min(0)
  distance!: number;

  @IsInt()
  @Min(1)
  estimatedDuration!: number;
}
