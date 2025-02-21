import { Controller, Get, UseGuards } from '@nestjs/common';
import { AddonsService } from './addons.service';
import { ApiBearerAuth, ApiForbiddenResponse, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { OKDTO } from 'src/shared/dto/ok.dto';

@Controller({ path: 'api/addons', version: '1' })
export class AddonsController {
  constructor(private readonly addonsService: AddonsService) {}

  @ApiOperation({ summary: 'Get a list of all addons' })
  @Get('/')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @UseGuards(AuthGuard(['jwt', 'anonymous']))
  @ApiBearerAuth('bearerAuth')
  async getAddons() {
    return this.addonsService.getAddonsList();
  }

  @ApiOperation({ summary: 'Get a list of all operators' })
  @Get('/operators')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @UseGuards(AuthGuard(['jwt', 'anonymous']))
  @ApiBearerAuth('bearerAuth')
  async getOperators() {
    return this.addonsService.getOperatorsList();
  }
}
