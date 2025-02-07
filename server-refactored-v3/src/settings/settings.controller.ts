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

    @ApiOperation({ summary: 'Get a list of allredy taken domains on this Kubernets cluster' })
    @Get('/domains')
    async getDomains() {
        return this.settingsService.getDomains();
    }

    @ApiOperation({ summary: 'Get the templates settings' })
    @Get('/templates')
    async getTemplates() {
        return this.settingsService.getTemplateConfig();
    }

    // TODO: Move to kubernetes module
    @ApiOperation({ summary: 'Get available contexts' })
    @Get('/contexts')
    async getContexts() {
        return this.settingsService.getContexts();
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
/*
    @Get('/clusterissuer')
    async getClusterIssuer() {
        return this.settingsService.getClusterIssuer();
    }
    @Get('/buildpacks')
    async getBuildpacks() {
        return this.settingsService.getBuildpacks();
    }
*/
}
