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
import { GroupsService } from './groups.service';

@Controller({ path: 'api/groups', version: '1' })
export class GroupsController {

  constructor(private groupsService: GroupsService) {}

  @Get('/')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOkResponse({
    description: 'A List of Groups',
    type: OKDTO,
    isArray: true,
  })
  @ApiOperation({ summary: 'Get all Groups' })
  async getGroups() {
    return this.groupsService.findAll();
  }

  @Post('/')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOkResponse({
    description: 'Group created successfully',
    type: OKDTO,
    isArray: false,
  })
  @ApiOperation({ summary: 'Create a new Group' })
  async createGroup(@Body() groupData: any) {
    if (!groupData || !groupData.name || !groupData.description) {
      throw new Error('Invalid group data provided');
    }
    return this.groupsService.create(groupData.name, groupData.description);
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOkResponse({
    description: 'Group deleted successfully',
    type: OKDTO,
    isArray: false,
  })
  @ApiOperation({ summary: 'Delete a Group by ID' })
  async deleteGroup(@Param('id') id: string) {
    if (!id) {
      throw new Error('Group ID is required');
    }
    return this.groupsService.delete(id);
  }

  @Put('/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOkResponse({
    description: 'Group updated successfully',
    type: OKDTO,
    isArray: false,
  })
  @ApiOperation({ summary: 'Update a Group by ID' })
  async updateGroup(
    @Param('id') id: string,
    @Body() groupData: any,
  ) {
    if (!id || !groupData || !groupData.name || !groupData.description) {
      throw new Error('Invalid group data provided');
    }
    return this.groupsService.update(id, groupData);
  }
}
