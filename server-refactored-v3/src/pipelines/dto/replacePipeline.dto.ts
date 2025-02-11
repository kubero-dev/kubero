
import { ApiProperty } from '@nestjs/swagger';
import { IBuildpack, IRegistry } from '../../settings/settings.interface';
import { IPipelinePhase, IgitLink } from '../pipelines.interface';

export class CreatePipelineDTO {
  
  @ApiProperty()
  pipelineName: string;
  
  @ApiProperty()
  domain: string;
  
  @ApiProperty()
  reviewapps: boolean;
  
  @ApiProperty()
  phases: IPipelinePhase[];
  
  @ApiProperty()
  buildpack: IBuildpack
  
  @ApiProperty()
  git: IgitLink;
  
  @ApiProperty()
  registry: IRegistry;
  
  @ApiProperty()
  dockerimage: string;
  
  @ApiProperty()
  deploymentstrategy: 'git' | 'docker';
  
  @ApiProperty()
  buildstrategy: 'plain' | 'dockerfile' | 'nixpacks' | 'buildpacks';
  
  @ApiProperty()
  resourceVersion?: string; // required to update resource, not part of spec
}