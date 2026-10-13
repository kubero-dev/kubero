import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/strategies/jwt.guard';
import { OKDTO } from '../common/dto/ok.dto';
import { TokenService } from './token.service';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';
import { ReadonlyGuard } from '../common/guards/readonly.guard';

@Controller({ path: 'api/tokens', version: '1' })
export class TokenController {
  constructor(private tokenService: TokenService) {}

  @Get('/')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('token:write', 'token:read')
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOkResponse({
    description: 'A List of Tokens',
    type: OKDTO,
    isArray: true,
  })
  @ApiOperation({ summary: 'Get all Tokens' })
  async getTokens() {
    return this.tokenService.findAll();
  }
  /*
    @Post('/user/:userId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('bearerAuth')
    @ApiForbiddenResponse({
      description: 'Error: Unauthorized',
      type: OKDTO,
      isArray: false,
    })
    @ApiOkResponse({
      description: 'Token created successfully',
      type: OKDTO,
      isArray: false,
    })
    @ApiOperation({ summary: 'Create a new Token for a User' })
    async createToken(@Param('userId') userId: string, @Body() tokenData: any) {
        if (!tokenData || !tokenData.token || !tokenData.expiresAt || !userId) {
            throw new HttpException('Invalid token data', HttpStatus.BAD_REQUEST);
        }
        return this.tokenService.create(tokenData, userId);
    }
*/
  @Post('/my')
  @UseGuards(JwtAuthGuard, PermissionsGuard, ReadonlyGuard)
  @Permissions('token:ok', 'token:write')
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOkResponse({
    description: 'Token created successfully',
    type: OKDTO,
    isArray: false,
  })
  @ApiOperation({
    summary: 'Create a new Token for the current logged in user',
  })
  async createToken(@Body() tokenData: any, @Request() req: any) {
    if (
      !tokenData ||
      !tokenData.name ||
      !tokenData.expiresAt ||
      !req.user.userId
    ) {
      throw new HttpException('Invalid token data', HttpStatus.BAD_REQUEST);
    }

    const token = this.tokenService.create(
      tokenData.name,
      tokenData.expiresAt,
      req.user.userId,
      req.user.username,
      req.user.role,
      req.user.userGroups,
    );
    return token;
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard, ReadonlyGuard)
  @Permissions('token:ok', 'token:write')
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOkResponse({
    description: 'Token deleted successfully',
    type: OKDTO,
    isArray: false,
  })
  @ApiOperation({ summary: 'Delete a Token' })
  async deleteToken(@Param('id') id: string) {
    if (!id) {
      throw new HttpException('Token ID is required', HttpStatus.BAD_REQUEST);
    }
    return this.tokenService.delete(id);
  }

  @Get('/my')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('token:ok', 'token:write')
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOkResponse({
    description: 'A List of Tokens for the current user',
    type: OKDTO,
    isArray: true,
  })
  @ApiOperation({ summary: 'Get all Tokens for the current user' })
  async getMyTokens(@Request() req: any) {
    const userId = req.user.userId;
    if (!userId) {
      throw new HttpException('User ID is required', HttpStatus.BAD_REQUEST);
    }
    return this.tokenService
      .findAll()
      .then((tokens) => tokens.filter((token) => token.user.id === userId));
  }

  @Delete('/my/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard, ReadonlyGuard)
  @Permissions('token:ok', 'token:write')
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOkResponse({
    description: 'Token deleted successfully for the current user',
    type: OKDTO,
    isArray: false,
  })
  @ApiOperation({ summary: 'Delete a Token for the current user' })
  async deleteMyToken(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.userId;
    if (!id || !userId) {
      throw new HttpException(
        'Token ID and User ID are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.tokenService.delete(id).then(() => {
      this.tokenService
        .findAll()
        .then((tokens) => tokens.filter((token) => token.user.id === userId));
    });
  }
}
