import { IsString, MaxLength, IsInt, IsNumber, Min } from 'class-validator';

// TRACED: FD-RTE-001
export class CreateRouteDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsString()
  @MaxLength(255)
  origin!: string;

  @IsString()
  @MaxLength(255)
  destination!: string;

  @IsNumber()
  distanceMiles!: number;

  @IsInt()
  @Min(1)
  estimatedTime!: number;
}
