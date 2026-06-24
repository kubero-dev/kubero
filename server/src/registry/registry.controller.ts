import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  UnauthorizedException,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
  UseGuards,
  Request,
  Req,
  Query,
} from '@nestjs/common';
import { RegistryService } from './registry.service';
import { ConfigService } from 'src/config/config.service';

@Controller({ path: 'api/registry', version: '1' })
export class RegistryController {
  private readonly logger = new Logger(RegistryController.name);

  constructor(
    private registryService: RegistryService,
    private configService: ConfigService,
  ) {}

  private parseAuthHeader(authHeader: string) {
    if (!authHeader) {
      this.logger.verbose('auth header missing');
      throw new UnauthorizedException('Authorization header is missing');
    }

    // Extract the base64-encoded credentials
    const authData = authHeader.split(' ');
    const authType = authData[0];
    const base64Credentials = authData[1];
    if (authType.toLowerCase() != 'basic' || !base64Credentials) {
      this.logger.verbose('auth header invalid');
      throw new UnauthorizedException('Invalid authorization header');
    }

    // Decode the credentials
    const credentials = Buffer.from(base64Credentials, 'base64').toString(
      'utf-8',
    );
    const [username, password] = credentials.split(':');

    if (!username || !password) {
      this.logger.verbose('invalid credentials');
      throw new UnauthorizedException('Invalid credentials format');
    }

    return [username, password];
  }

  @Get('/token')
  async getPipelineToken(
    @Headers('authorization') authHeader: string,
    @Query('service') service: string,
    @Query('scope') scope: string | string[],
  ) {
    const [username, password] = this.parseAuthHeader(authHeader);

    const jwt = await this.registryService.generateToken(
      username,
      password,
      service,
      scope,
    );

    return {
      token: jwt,
    };
  }
}
