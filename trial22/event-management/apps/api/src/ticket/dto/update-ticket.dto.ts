import { IsString, MaxLength, IsOptional, IsIn } from 'class-validator';

export class UpdateTicketDto {
  @IsOptional()
  @IsString()
  @IsIn(['AVAILABLE', 'SOLD', 'RESERVED', 'CANCELLED'])
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  attendeeId?: string;
}
