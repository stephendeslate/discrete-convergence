import { IsString, MinLength, MaxLength, IsInt, Min, IsOptional } from 'class-validator';

export class UpdateVenueDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  @IsOptional()
  name?: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  address?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  capacity?: number;
}
