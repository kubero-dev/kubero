import { ApiProperty } from '@nestjs/swagger';

export class UserDTO {
  @ApiProperty()
  id: string;

  @ApiProperty({ required: true })
  username: string;

  @ApiProperty({ required: false })
  firstName?: string;

  @ApiProperty({ required: false })
  lastName?: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false })
  emailVerified?: Date;

  @ApiProperty({ required: false })
  image?: string;

  @ApiProperty({ required: false })
  isActive?: boolean;
}

export class GetAllUsersDTO {
  @ApiProperty({ type: [UserDTO] })
  users: UserDTO[];
}
