// TRACED: FD-RTE-001
import { IsString, MaxLength, IsOptional, IsNumber, Min, IsInt } from 'class-validator';

export class CreateRouteDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsNumber()
  @Min(0)
  distance!: number;

  @IsInt()
  @Min(1)
  estimatedTime!: number;
}
