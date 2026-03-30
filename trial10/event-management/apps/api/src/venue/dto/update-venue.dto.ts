import { IsString, MaxLength, IsOptional, IsInt, Min, Max } from 'class-validator';

export class UpdateVenueDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  address?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(100000)
  capacity?: number;
}
