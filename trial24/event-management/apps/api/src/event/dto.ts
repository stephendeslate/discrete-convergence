// TRACED:EVENT-DTO
import { IsString, IsOptional, IsDateString, IsEnum, IsUUID, MaxLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export enum EventStatusDto {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CANCELLED = 'CANCELLED',
}

export class CreateEventDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsEnum(EventStatusDto)
  status?: EventStatusDto;

  @IsOptional()
  @IsUUID()
  venueId?: string;
}

export class UpdateEventDto extends PartialType(CreateEventDto) {}
