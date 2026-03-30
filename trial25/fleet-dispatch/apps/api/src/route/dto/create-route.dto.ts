// TRACED:FD-RTE-001 — Create route DTO
import { IsString, IsNumber, IsInt, IsOptional, Min, MaxLength } from 'class-validator';

export class CreateRouteDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsString()
  @MaxLength(255)
  origin!: string;

  @IsString()
  @MaxLength(255)
  destination!: string;

  @IsNumber()
  @Min(0)
  distance!: number;

  @IsInt()
  @Min(1)
  estimatedDuration!: number;
}
