import { IsOptional, IsString, IsIn, MaxLength } from 'class-validator';

// TRACED: EM-DATA-005 — Ticket update DTO
export class UpdateTicketDto {
  @IsOptional()
  @IsIn(['AVAILABLE', 'RESERVED', 'SOLD', 'CANCELLED'])
  @IsString()
  @MaxLength(20)
  status?: string;
}
