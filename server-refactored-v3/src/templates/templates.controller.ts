import { Controller, Get } from '@nestjs/common';

@Controller('templates')
export class TemplatesController {
    constructor() {}
    
    @Get('/catalogs')
    async getTemplates() {
        return 'getTemplates';
    }
}
