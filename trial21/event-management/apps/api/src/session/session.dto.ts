import { IsString, MaxLength, IsDateString, IsOptional } from 'class-validator';

/** TRACED:EM-EVT-004 — Session DTO with time validation */
export class CreateSessionDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsDateString()
  startTime!: string;

  @IsDateString()
  endTime!: string;
}

export class UpdateSessionDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;
}
