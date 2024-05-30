import { ApiProperty } from "@nestjs/swagger";

export class User {
  @ApiProperty({ description: 'User unique identifier', nullable: false })
  id: number

  @ApiProperty({ description: 'User email', nullable: false })
  email: string

  @ApiProperty({ description: 'User password', nullable: false })
  password: string
}
