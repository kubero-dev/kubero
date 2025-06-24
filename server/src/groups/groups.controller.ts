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
}
