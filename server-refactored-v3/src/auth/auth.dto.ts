import { ApiProperty } from '@nestjs/swagger';

export class GetMethodsDTO {
  @ApiProperty({default: false})
  local: boolean

  @ApiProperty({default: false})
  github: boolean

  @ApiProperty({default: false})
  oauth2: boolean
}

export class LoginOKResponseDTO {
  @ApiProperty()
  access_token: string
}

export class LoginDTO {
  @ApiProperty()
  username: string

  @ApiProperty()
  password: string
}

export class GetSessionDTO {
  @ApiProperty()
  isAuthenticated: boolean
  @ApiProperty()
  version: string
  @ApiProperty()
  kubernetesVersion: string
  @ApiProperty()
  operatorVersion: string
  @ApiProperty()
  buildPipeline: boolean
  @ApiProperty()
  templatesEnabled: boolean
  @ApiProperty()
  auditEnabled: boolean
  @ApiProperty()
  adminDisabled: boolean
  @ApiProperty()
  consoleEnabled: boolean
  @ApiProperty()
  metricsEnabled: boolean
  @ApiProperty()
  sleepEnabled: boolean
}
