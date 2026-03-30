// TRACED: FD-RTE-002
import { IsString, MaxLength, IsOptional, IsNumber, Min, IsInt, IsIn } from 'class-validator';

export class UpdateRouteDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsIn(['PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED'])
  @IsString()
  @MaxLength(20)
  status?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  distance?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedTime?: number;
}
