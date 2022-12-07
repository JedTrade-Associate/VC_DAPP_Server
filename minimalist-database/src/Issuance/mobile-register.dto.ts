import { ApiProperty } from '@nestjs/swagger';

export class mobileRegisterDto {
  @ApiProperty({
      description: 'deviceId'
  })
  readonly deviceId: string;
}