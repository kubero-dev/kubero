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
import { ReadonlyGuard } from '../common/guards/readonly.guard';

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

  @Post('/')
  @UseGuards(JwtAuthGuard, PermissionsGuard, ReadonlyGuard)
  @Permissions('user:write')
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOkResponse({
    description: 'Role created successfully',
    type: OKDTO,
    isArray: false,
  })
  @ApiOperation({ summary: 'Create a new Role' })
  async createRole(@Body() role: any) {
    return this.rolesService.createRole(role);
  }

  @Delete('/:roleId')
  @UseGuards(JwtAuthGuard, PermissionsGuard, ReadonlyGuard)
  @Permissions('user:write')
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOkResponse({
    description: 'Role deleted successfully',
    type: OKDTO,
    isArray: false,
  })
  @ApiOperation({ summary: 'Delete a Role' })
  async deleteRole(@Param('roleId') roleId: string) {
    return this.rolesService.deleteRole(roleId);
  }

  @Put('/:roleId')
  @UseGuards(JwtAuthGuard, PermissionsGuard, ReadonlyGuard)
  @Permissions('user:write')
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOkResponse({
    description: 'Role updated successfully',
    type: OKDTO,
    isArray: false,
  })
  @ApiOperation({ summary: 'Update a Role' })
  async updateRole(@Param('roleId') roleId: string, @Body() role: any) {
    return this.rolesService.updateRole(roleId, role);
  }
}
