import { IsString, MaxLength, IsInt, Min } from 'class-validator';

// TRACED: EM-VENUE-001
export class CreateVenueDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsString()
  @MaxLength(500)
  address!: string;

  @IsInt()
  @Min(1)
  capacity!: number;
}
