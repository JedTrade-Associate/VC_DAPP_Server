import { ApiProperty } from '@nestjs/swagger';

export class CreateDocDto {
  @ApiProperty({
    description: 'Public wallet'
  })
  readonly wallet: string;
}