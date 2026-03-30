import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateVenueDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsInt()
  @Min(1)
  capacity: number;
}
