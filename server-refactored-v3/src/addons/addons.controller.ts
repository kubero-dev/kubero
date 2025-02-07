import { Controller, Get } from '@nestjs/common';
import { AddonsService } from './addons.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller({ path: 'api/addons', version: '1' })
export class AddonsController {
  constructor(
    private readonly addonsService: AddonsService
  ) {}
  

  @ApiOperation({ summary: 'Get a list of all addons' })
  @Get('/')
  async getAddons() {
    return this.addonsService.getAddonsList();
  }

  @ApiOperation({ summary: 'Get a list of all operators' })
  @Get('/operators')
  async getOperators() {
    return this.addonsService.getOperatorsList();
  }
}
