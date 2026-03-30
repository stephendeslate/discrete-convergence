import { IsString, MaxLength, IsNumber, Min, IsOptional, IsIn } from 'class-validator';

// TRACED: EM-TICKET-002
export class UpdateTicketDto {
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  type?: string;

  @IsOptional()
  @IsIn(['AVAILABLE', 'SOLD', 'CANCELLED', 'REFUNDED'])
  @IsString()
  @MaxLength(20)
  status?: string;
}
