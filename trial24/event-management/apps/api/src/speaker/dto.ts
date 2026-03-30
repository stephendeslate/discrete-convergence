// TRACED:SPEAKER-DTO
import { IsString, IsEmail, IsOptional, MaxLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateSpeakerDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  bio?: string;
}

export class UpdateSpeakerDto extends PartialType(CreateSpeakerDto) {}
