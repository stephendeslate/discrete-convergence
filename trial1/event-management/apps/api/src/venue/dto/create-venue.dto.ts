import { IsString, MinLength, MaxLength, IsInt, Min, IsOptional } from 'class-validator';

export class CreateVenueDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  address?: string;

  @IsInt()
  @Min(1)
  capacity!: number;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  type?: string;
}
