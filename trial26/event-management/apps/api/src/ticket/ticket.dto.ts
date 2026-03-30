// TRACED:EM-TKT-001
import { IsString, IsOptional, IsInt, Min, MaxLength, IsEnum, IsUUID } from 'class-validator';

export class CreateTicketDto {
  @IsUUID()
  @MaxLength(36)
  eventId!: string;

  @IsOptional()
  @IsUUID()
  @MaxLength(36)
  attendeeId?: string;

  @IsOptional()
  @IsEnum(['GENERAL', 'VIP', 'EARLY_BIRD'])
  @MaxLength(20)
  type?: 'GENERAL' | 'VIP' | 'EARLY_BIRD';

  @IsInt()
  @Min(0)
  price!: number;
}
