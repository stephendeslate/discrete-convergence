import {
  IsOptional,
  IsArray,
  IsString,
  IsBoolean,
  IsNumber,
} from 'class-validator';

export class UpdateTechnicianDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}
