import { IsString, MaxLength, IsNumber, IsInt, Min } from 'class-validator';

export class CreateStopDto {
  @IsString()
  @MaxLength(36)
  routeId!: string;

  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @MaxLength(500)
  address!: string;

  @IsNumber()
  latitude!: number;

  @IsNumber()
  longitude!: number;

  @IsInt()
  @Min(0)
  sequence!: number;
}
