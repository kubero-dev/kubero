import { Controller, Get } from '@nestjs/common';
//import { ApiTags } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller({ path: 'api/settings', version: '1' })
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) {}


    @ApiOperation({ summary: 'Get the Kubero settings' })
    @Get('/')
    async getSettings() {
        return this.settingsService.getSettings();
    }

    @ApiOperation({ summary: 'Get the banner informations' })
    @Get('/banner')
    async getBanner() {
        return this.settingsService.getBanner();
    }

    @ApiOperation({ summary: 'Get the templates settings' })
    @Get('/templates')
    async getTemplates() {
        return this.settingsService.getTemplateConfig();
    }

    @ApiOperation({ summary: 'Get the registry settings' })
    @Get('/registry')
    async getRegistry() {
        return this.settingsService.getRegistry();
    }

    @ApiOperation({ summary: 'List runpacks' })
    @Get('/runpacks')
    async getRunpacks() {
        return this.settingsService.getRunpacks();
    }

    @ApiOperation({ summary: 'Get the configured cluster issuer' })
    @Get('/clusterissuer')
    async getClusterIssuer() {
        return this.settingsService.getClusterIssuer();
    }

    @ApiOperation({ summary: 'List buildpacks' })
    @Get('/buildpacks')
    async getBuildpacks() {
        return this.settingsService.getBuildpacks();
    }

    @ApiOperation({ summary: 'List available pod sizes' })
    @Get('/podsizes')
    async getPodSizes() {
        return this.settingsService.getPodSizes();
    }

}
