import { IsString, MaxLength, IsNumber, IsInt, Min, IsOptional, IsIn } from 'class-validator';

// TRACED: EM-TICKET-001
export class CreateTicketDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;

  @IsInt()
  @Min(0)
  quantity!: number;

  @IsOptional()
  @IsString()
  @IsIn(['AVAILABLE', 'RESERVED', 'SOLD', 'CANCELLED'])
  status?: string;

  @IsString()
  @MaxLength(36)
  eventId!: string;
}
