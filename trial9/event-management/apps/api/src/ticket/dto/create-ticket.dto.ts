import { IsString, MaxLength, IsNumber, Min, IsOptional, IsIn } from 'class-validator';

// TRACED: EM-TICKET-001
export class CreateTicketDto {
  @IsString()
  @MaxLength(36)
  eventId!: string;

  @IsString()
  @MaxLength(100)
  type!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsString()
  @IsIn(['AVAILABLE', 'SOLD', 'CANCELLED', 'REFUNDED'])
  status?: string;
}
