import { IsString, MaxLength, IsNumber, Min } from 'class-validator';

export class CreateVenueDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @MaxLength(500)
  address!: string;

  @IsNumber()
  @Min(1)
  capacity!: number;
}
