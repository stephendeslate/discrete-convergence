import { IsString, MaxLength, IsNumber } from 'class-validator';

export class CreateGeofenceDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsNumber()
  latitude!: number;

  @IsNumber()
  longitude!: number;

  @IsNumber()
  radius!: number;
}
