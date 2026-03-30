import {
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  MinLength,
} from 'class-validator';

export class CreateTechnicianDto {
  @IsString()
  @MinLength(1)
  firstName!: string;

  @IsString()
  @MinLength(1)
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];
}
