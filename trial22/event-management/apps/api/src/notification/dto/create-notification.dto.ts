import { IsString, MaxLength, IsIn } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @IsIn(['EMAIL', 'SMS', 'PUSH'])
  type!: string;

  @IsString()
  @MaxLength(500)
  subject!: string;

  @IsString()
  body!: string;
}
