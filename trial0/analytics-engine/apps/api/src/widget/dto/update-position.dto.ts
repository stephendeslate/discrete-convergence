import { IsInt } from 'class-validator';

export class UpdatePositionDto {
  @IsInt()
  gridColumn!: number;

  @IsInt()
  gridRow!: number;

  @IsInt()
  gridWidth!: number;

  @IsInt()
  gridHeight!: number;
}
