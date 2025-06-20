import { 
  Controller,
  Get,
  Param,
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
import { UsersService } from './users.service';
import { GetAllUsersDTO } from './dto/users.dto';

@Controller({ path: 'api/users', version: '1' })
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('/')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOkResponse({
    description: 'A List of Users',
    type: GetAllUsersDTO,
    isArray: false,
  })
  @ApiOperation({ summary: 'Get all Users' })
  async getPipelines() {
    return this.usersService.findAll();
  }

  @Get('/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOkResponse({
    description: 'The current User',
    type: GetAllUsersDTO,
    isArray: false,
  })
  @ApiOperation({ summary: 'Get current User' })
  async getMe() {
    return this.usersService.findByUsername(
      (this.usersService as any).request.user.username,
    );
  }
  @Get('/username/:username')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOkResponse({
    description: 'A User by username',
    type: GetAllUsersDTO,
    isArray: false,
  })
  @ApiOperation({ summary: 'Get User by username' })
  async getUserByUsername(@Param('username') username: string) {
    return this.usersService.findByUsername(username);
  }
  @Get('/id/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOkResponse({
    description: 'A User by ID',
    type: GetAllUsersDTO,
    isArray: false,
  })
  @ApiOperation({ summary: 'Get User by ID' })
  async getUserById(@Param('id') id: number) {
    return this.usersService.findById(id);
  }
  @Get('/count')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOkResponse({
    description: 'Count of Users',
    type: OKDTO,
    isArray: false,
  })
  @ApiOperation({ summary: 'Get count of Users' })
  async getUserCount() {
    return this.usersService.count();
  }
}
