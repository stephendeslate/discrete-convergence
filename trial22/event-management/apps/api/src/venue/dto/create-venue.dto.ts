import { IsString, MaxLength, IsOptional, IsInt, Min } from 'class-validator';

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

  @IsOptional()
  @IsInt()
  @Min(0)
  capacity?: number;
}
