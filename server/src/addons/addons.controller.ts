import { Controller, Get, UseGuards } from '@nestjs/common';
import { AddonsService } from './addons.service';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { OKDTO } from '../common/dto/ok.dto';
import { JwtAuthGuard } from '../auth/strategies/jwt.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';

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
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('pipeline:read', 'pipeline:write')
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
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('pipeline:read', 'pipeline:write')
  @ApiBearerAuth('bearerAuth')
  async getOperators() {
    return this.addonsService.getOperatorsList();
  }
}
