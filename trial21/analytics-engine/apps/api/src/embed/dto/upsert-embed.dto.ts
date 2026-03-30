import { IsArray, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpsertEmbedDto {
  @IsArray()
  @IsString({ each: true })
  @MaxLength(255, { each: true })
  allowedOrigins!: string[];

  @IsOptional()
  @IsObject()
  theme?: Record<string, unknown>;
}
