import { IsString, MaxLength, IsIn, IsOptional } from 'class-validator';

export class CreateApiKeyDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsIn(['ADMIN', 'EMBED'])
  keyType!: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  expiresAt?: string;
}
