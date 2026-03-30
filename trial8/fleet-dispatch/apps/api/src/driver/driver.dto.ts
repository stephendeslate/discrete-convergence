import { IsString, MaxLength, IsOptional, IsIn, IsArray } from 'class-validator';

export class CreateDriverDto {
  @IsString()
  @MaxLength(50)
  licenseNumber!: string;

  @IsString()
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];
}

export class UpdateDriverDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @IsIn(['ACTIVE', 'ON_LEAVE', 'TERMINATED'])
  status?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];
}
