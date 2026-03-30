import { IsString, MaxLength, IsNumber, Min } from 'class-validator';

// TRACED:FD-RTE-001
export class CreateRouteDto {
  @IsString()
  @MaxLength(36)
  tenantId!: string;

  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @MaxLength(255)
  origin!: string;

  @IsString()
  @MaxLength(255)
  destination!: string;

  @IsNumber()
  @Min(0)
  distanceKm!: number;
}
