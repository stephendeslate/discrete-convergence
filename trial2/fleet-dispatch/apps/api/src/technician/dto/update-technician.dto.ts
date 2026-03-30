import { IsOptional, IsArray, IsString, IsBoolean } from 'class-validator';

export class UpdateTechnicianDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
