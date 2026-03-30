import { IsString, MaxLength, IsOptional, IsArray, IsNumber } from 'class-validator';

export class CreateTechnicianDto {
  @IsString()
  @MaxLength(36)
  userId!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}
