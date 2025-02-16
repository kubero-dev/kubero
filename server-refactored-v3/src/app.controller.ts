import {
  Controller,
  Request,
  All,
  Get,
  Post,
  UseGuards,
  HttpStatus,
  HttpCode,
  Res,
} from '@nestjs/common';
//import { Response } from 'express';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService) {
  }

  @Get('/test/auth')
  @UseGuards(AuthGuard(['local']))
  getHello(@Request() req) {
    return req.user + ' ' + req.authenticated + ' ' + req.isAuthenticated();  
  }
}
