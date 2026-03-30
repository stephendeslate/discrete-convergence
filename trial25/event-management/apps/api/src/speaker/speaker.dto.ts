// TRACED:EM-SPK-001 TRACED:EM-SPK-003
import { IsString, IsOptional, IsEmail, MaxLength } from 'class-validator';

export class CreateSpeakerDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @IsEmail()
  @MaxLength(255)
  email!: string;
}

export class UpdateSpeakerDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;
}
