import { IsString, MaxLength, IsInt, Min } from 'class-validator';

// TRACED: EM-VENUE-001
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

  @IsInt()
  @Min(1)
  capacity!: number;
}
