import { IsString, MaxLength, IsOptional, IsInt, Min, IsBoolean } from 'class-validator';

export class CreateVenueDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsInt()
  @Min(1)
  capacity!: number;

  @IsOptional()
  @IsBoolean()
  isVirtual?: boolean;
}
