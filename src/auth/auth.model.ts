import { ApiProperty } from '@nestjs/swagger'
export class authModel {
  @ApiProperty({ description: 'User email', nullable: false })
  email: string

  @ApiProperty({ description: 'User password', nullable: false })
  password: string
}
