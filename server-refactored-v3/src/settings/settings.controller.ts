import { Controller, Get } from '@nestjs/common';
//import { ApiTags } from '@nestjs/swagger';
import { SettingsService } from './settings.service';

@Controller({ path: 'api/settings', version: '1' })
@Controller('settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) {}

    @Get('/')
    async getSettings() {
        return this.settingsService.getSettings();
    }
}
