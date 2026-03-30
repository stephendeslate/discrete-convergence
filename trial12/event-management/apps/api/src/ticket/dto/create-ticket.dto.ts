import { IsString, MaxLength, IsNumber, Min } from 'class-validator';

// TRACED: EM-TICKET-001
export class CreateTicketDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;

  @IsString()
  @MaxLength(100)
  type!: string;

  @IsString()
  @MaxLength(36)
  eventId!: string;
}
