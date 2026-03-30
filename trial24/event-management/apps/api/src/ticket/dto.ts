// TRACED:TICKET-DTO
import { IsString, IsInt, IsPositive, IsUUID, IsNumberString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateTicketDto {
  @IsString()
  type!: string;

  @IsNumberString()
  price!: string;

  @IsInt()
  @IsPositive()
  quantity!: number;

  @IsUUID()
  eventId!: string;
}

export class UpdateTicketDto extends PartialType(CreateTicketDto) {}
