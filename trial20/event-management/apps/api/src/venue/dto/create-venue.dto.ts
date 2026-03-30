import { IsString, IsInt, MaxLength, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVenueDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @MaxLength(500)
  address!: string;

  @IsString()
  @MaxLength(255)
  city!: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  capacity!: number;
}

export class UpdateVenueDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  city?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  capacity?: number;
}
