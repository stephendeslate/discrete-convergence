import { IsString, MaxLength, IsOptional, IsIn } from 'class-validator';

export class UpdateNotificationDto {
  @IsOptional()
  @IsString()
  @IsIn(['EMAIL', 'SMS', 'PUSH'])
  type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  subject?: string;

  @IsOptional()
  @IsString()
  body?: string;
}
