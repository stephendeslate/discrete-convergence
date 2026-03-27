// TRACED: EM-SEC-002 — Create venue DTO with validation
import { IsString, IsNotEmpty, MaxLength, IsInt, Min } from 'class-validator';

export class CreateVenueDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  address!: string;

  @IsInt()
  @Min(1)
  capacity!: number;
}
