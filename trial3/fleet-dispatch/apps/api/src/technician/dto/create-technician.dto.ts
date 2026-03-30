import { IsString, IsOptional, MaxLength, IsArray } from 'class-validator';

export class CreateTechnicianDto {
  @IsString()
  @MaxLength(36)
  userId!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];
}
