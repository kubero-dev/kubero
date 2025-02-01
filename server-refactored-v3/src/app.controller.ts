import { Controller, Request, All, Get, Post, UseGuards, HttpStatus, HttpCode, Res } from '@nestjs/common';
//import { Response } from 'express';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(AuthGuard('local'))
  @Get('/hello')
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(AuthGuard('local'))
  @Post('auth/login')
  async login(@Request() req) {
    return req.user;
  }
/*
  @All('*')
  @HttpCode(404)
  catchAll(@Res() res: Response) {
  //catchAll() {
    res.status(404);
    res.json({"statusCode":404,"message":"Not Found"});
    //return '{"statusCode":404,"message":"Not Found"}';
  }
*/
}
