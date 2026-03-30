import { IsString, MaxLength } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @MaxLength(500)
  subject!: string;

  @IsString()
  @MaxLength(10000)
  body!: string;
}
