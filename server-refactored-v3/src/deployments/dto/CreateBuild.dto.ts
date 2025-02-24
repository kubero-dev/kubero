import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBuild {
  @ApiProperty({ enum: ['buildpacks', 'dockerfile', 'nixpacks', 'plain'] })
  buildstrategy: 'buildpacks' | 'dockerfile' | 'nixpacks' | 'plain';

  @ApiProperty()
  repository: string;

  @ApiProperty()
  reference: string;

  @ApiProperty()
  dockerfilePath: string;
}
