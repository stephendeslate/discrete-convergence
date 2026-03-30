import { IsString, MaxLength, IsNumber, Min } from 'class-validator';

export class CreateTicketTypeDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsNumber()
  @Min(0)
  quantity!: number;

  @IsString()
  @MaxLength(36)
  eventId!: string;
}
