import { IsString, MaxLength, IsOptional, IsEmail } from 'class-validator';

export class CreateSpeakerDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  bio?: string;

  @IsEmail()
  @IsString()
  @MaxLength(255)
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  company?: string;
}
