import { IsString, MaxLength, IsInt, Min, IsOptional } from 'class-validator';

// TRACED:EM-VEN-001
export class CreateVenueDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsString()
  @MaxLength(500)
  address!: string;

  @IsString()
  @MaxLength(100)
  city!: string;

  @IsInt()
  @Min(1)
  capacity!: number;
}

// TRACED:EM-VEN-002
export class UpdateVenueDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;
}
