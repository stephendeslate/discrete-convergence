import { IsString, MaxLength, IsOptional, IsIn, IsNumber } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  @MaxLength(36)
  eventId!: string;

  @IsString()
  @MaxLength(36)
  ticketTypeId!: string;

  @IsNumber()
  price!: number;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  attendeeId?: string;

  @IsOptional()
  @IsString()
  @IsIn(['AVAILABLE', 'SOLD', 'RESERVED', 'CANCELLED'])
  status?: string;
}
