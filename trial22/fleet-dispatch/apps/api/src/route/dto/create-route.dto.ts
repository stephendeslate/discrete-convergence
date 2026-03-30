import { IsString, MaxLength, IsOptional, IsIn, IsNumber, Min } from 'class-validator';

export class CreateRouteDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsNumber()
  @Min(0)
  distance!: number;

  @IsOptional()
  @IsString()
  @IsIn(['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED'])
  status?: string;
}
