import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/strategies/jwt.guard';
import { OKDTO } from '../common/dto/ok.dto';
import { RolesService } from './roles.service';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';

@Controller({ path: 'api/roles', version: '1' })
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get('/')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('user:read', 'user:write')
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOkResponse({
    description: 'A List of Roles',
    type: OKDTO,
    isArray: true,
  })
  @ApiOperation({ summary: 'Get all Roles' })
  async getRoles() {
    return this.rolesService.findAll();
  }
}
