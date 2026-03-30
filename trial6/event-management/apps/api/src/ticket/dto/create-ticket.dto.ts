import { IsString, IsInt, IsIn, Min, IsUUID, IsNumberString } from 'class-validator';

export class CreateTicketDto {
  @IsIn(['GENERAL', 'VIP', 'EARLY_BIRD'])
  @IsString()
  type!: string;

  @IsNumberString()
  price!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsString()
  @IsUUID()
  eventId!: string;
}
