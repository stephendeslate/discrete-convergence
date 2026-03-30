import { IsString, MaxLength, IsInt, Min, Max } from 'class-validator';

export class CreateVenueDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @MaxLength(500)
  address!: string;

  @IsInt()
  @Min(1)
  @Max(100000)
  capacity!: number;
}
