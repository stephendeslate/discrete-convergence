import { IsString, IsOptional, IsUrl } from 'class-validator';

export class CreatePhotoDto {
  @IsUrl()
  url!: string;

  @IsOptional()
  @IsString()
  caption?: string;
}
