import { IsString, MaxLength, IsOptional, IsIn, IsInt, Min, Max } from 'class-validator';

export class UpdateDispatchDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  priority?: number;

  @IsOptional()
  @IsString()
  @IsIn(['PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'FAILED'])
  status?: string;
}
