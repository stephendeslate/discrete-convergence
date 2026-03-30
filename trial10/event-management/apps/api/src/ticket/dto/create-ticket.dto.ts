// TRACED: EM-DATA-004 — Decimal for monetary fields, never Float
import { IsString, MaxLength, IsNumber, IsInt, Min, Max } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(999999999999)
  price!: number;

  @IsInt()
  @Min(1)
  @Max(100000)
  quantity!: number;

  @IsString()
  @MaxLength(36)
  eventId!: string;
}
