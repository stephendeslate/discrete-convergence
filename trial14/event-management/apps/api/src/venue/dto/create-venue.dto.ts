import { IsString, MaxLength, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateVenueDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsString()
  @MaxLength(500)
  address!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  capacity?: number;
}
