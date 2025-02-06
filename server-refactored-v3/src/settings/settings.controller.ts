import { Controller, Get } from '@nestjs/common';
//import { ApiTags } from '@nestjs/swagger';
import { SettingsService } from './settings.service';

@Controller({ path: 'api/settings', version: '1' })
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) {}

    @Get('/')
    async getSettings() {
        return this.settingsService.getSettings();
    }

    @Get('/banner')
    async getBanner() {
        return this.settingsService.getBanner();
    }

    @Get('/domains')
    async getDomains() {
        return this.settingsService.getDomains();
    }
}
