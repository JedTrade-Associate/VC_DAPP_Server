import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'The Wallet Address of a user'
  })
  readonly wallet: string;

  @ApiProperty({
    description: 'Registered device of a user'
  })
  readonly deviceID: string;
}