import { IsString, IsOptional, IsInt, IsIn, Min, IsNumberString } from 'class-validator';

export class UpdateTicketDto {
  @IsOptional()
  @IsIn(['GENERAL', 'VIP', 'EARLY_BIRD'])
  @IsString()
  type?: string;

  @IsOptional()
  @IsNumberString()
  price?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;
}
