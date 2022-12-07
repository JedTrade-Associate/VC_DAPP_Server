import { ApiProperty } from '@nestjs/swagger';


export class VerifyDocDto {
  @ApiProperty({
      description: "Document"
  })
  readonly template: JSON
}