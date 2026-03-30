// TRACED:SESSION-DTO
import { IsString, IsOptional, IsDateString, IsUUID, MaxLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateSessionDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startTime!: string;

  @IsDateString()
  endTime!: string;

  @IsUUID()
  eventId!: string;

  @IsOptional()
  @IsUUID()
  speakerId?: string;
}

export class UpdateSessionDto extends PartialType(CreateSessionDto) {}
