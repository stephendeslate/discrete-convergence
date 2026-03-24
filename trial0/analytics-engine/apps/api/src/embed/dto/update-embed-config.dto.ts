import { IsArray, IsBoolean, IsOptional, IsString, MaxLength, IsObject } from 'class-validator';

export class UpdateEmbedConfigDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  allowedOrigins?: string[];

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  @IsObject()
  themeOverrides?: Record<string, unknown>;
}
