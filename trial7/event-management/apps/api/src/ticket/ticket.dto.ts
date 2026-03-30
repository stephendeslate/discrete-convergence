import {
  IsString,
  MaxLength,
  IsOptional,
  IsIn,
  IsNumber,
  Min,
} from 'class-validator';

// TRACED:EM-TKT-001
export class CreateTicketDto {
  @IsString()
  @MaxLength(36)
  eventId!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  seatInfo?: string;
}

// TRACED:EM-TKT-002
export class UpdateTicketDto {
  @IsOptional()
  @IsIn(['RESERVED', 'CONFIRMED', 'CANCELLED', 'USED'])
  @IsString()
  @MaxLength(20)
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  seatInfo?: string;
}
