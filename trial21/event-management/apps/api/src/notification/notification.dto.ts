import { IsString, MaxLength, IsArray } from 'class-validator';

/** TRACED:EM-NTF-001 — Notification broadcast DTO */
export class BroadcastNotificationDto {
  @IsString()
  @MaxLength(255)
  subject!: string;

  @IsString()
  @MaxLength(5000)
  body!: string;

  @IsArray()
  @IsString({ each: true })
  userIds!: string[];
}
