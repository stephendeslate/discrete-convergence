import { IsArray, IsBoolean, IsOptional, IsString, MaxLength, IsObject } from 'class-validator';

export class CreateEmbedConfigDto {
  @IsArray()
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  allowedOrigins!: string[];

  @IsBoolean()
  isEnabled!: boolean;

  @IsOptional()
  @IsObject()
  themeOverrides?: Record<string, unknown>;
}
