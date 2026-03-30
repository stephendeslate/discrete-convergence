import { IsString, MaxLength, IsInt, Min } from 'class-validator';

export class CreateVenueDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @MaxLength(500)
  address!: string;

  @IsString()
  @MaxLength(100)
  city!: string;

  @IsString()
  @MaxLength(100)
  country!: string;

  @IsInt()
  @Min(1)
  capacity!: number;
}
