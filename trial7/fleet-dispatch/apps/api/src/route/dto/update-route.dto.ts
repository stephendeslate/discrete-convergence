import { IsString, MaxLength, IsNumber, Min, IsOptional, IsIn } from 'class-validator';

// TRACED:FD-RTE-002
export class UpdateRouteDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
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
  @Min(0)
  distanceKm?: number;

  @IsOptional()
  @IsIn(['PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED'])
  @IsString()
  @MaxLength(20)
  status?: string;
}
