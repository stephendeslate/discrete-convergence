// TRACED:VENUE-DTO
import { IsString, IsInt, IsPositive, MaxLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateVenueDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsString()
  address!: string;

  @IsInt()
  @IsPositive()
  capacity!: number;
}

export class UpdateVenueDto extends PartialType(CreateVenueDto) {}
