import { IsString, IsNumber, IsIn, MaxLength, IsUUID, Min } from 'class-validator';

// TRACED: EM-DATA-004 — Ticket creation DTO with class-validator decorators
export class CreateTicketDto {
  @IsUUID()
  @IsString()
  @MaxLength(36)
  eventId!: string;

  @IsIn(['GENERAL', 'VIP', 'EARLY_BIRD'])
  @IsString()
  @MaxLength(20)
  type!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;
}
