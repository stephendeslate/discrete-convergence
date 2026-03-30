import { IsString, MaxLength, IsInt, Min, IsOptional, IsEnum, IsNumber } from 'class-validator';

// TRACED: FD-ROUTE-001
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
  distance!: number;

  @IsInt()
  @Min(1)
  estimatedTime!: number;

  @IsOptional()
  @IsEnum(['DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED'])
  @IsString()
  @MaxLength(20)
  status?: string;
}
