import { IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateInventoryDto {
  @ApiProperty({ minimum: 0 })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  stock: number;
}
