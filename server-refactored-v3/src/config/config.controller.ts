import { Controller, Get } from '@nestjs/common';
//import { ApiTags } from '@nestjs/swagger';
import { ConfigService } from './config.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller({ path: 'api/config', version: '1' })
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @ApiOperation({ summary: 'Get the Kubero settings' })
  @Get('/')
  async getSettings() {
    return this.configService.getSettings();
  }

  @ApiOperation({ summary: 'Get the banner informations' })
  @Get('/banner')
  async getBanner() {
    return this.configService.getBanner();
  }

  @ApiOperation({ summary: 'Get the templates settings' })
  @Get('/templates')
  async getTemplates() {
    return this.configService.getTemplateConfig();
  }

  @ApiOperation({ summary: 'Get the registry settings' })
  @Get('/registry')
  async getRegistry() {
    return this.configService.getRegistry();
  }

  @ApiOperation({ summary: 'List runpacks' })
  @Get('/runpacks')
  async getRunpacks() {
    return this.configService.getRunpacks();
  }

  @ApiOperation({ summary: 'Get the configured cluster issuer' })
  @Get('/clusterissuer')
  async getClusterIssuer() {
    return this.configService.getClusterIssuer();
  }

  @ApiOperation({ summary: 'List buildpacks' })
  @Get('/buildpacks')
  async getBuildpacks() {
    return this.configService.getBuildpacks();
  }

  @ApiOperation({ summary: 'List available pod sizes' })
  @Get('/podsizes')
  async getPodSizes() {
    return this.configService.getPodSizes();
  }
}
