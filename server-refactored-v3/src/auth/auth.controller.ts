import { Controller, Request, UseGuards, Post, Get, Response } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
@Controller({ path: 'api/auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Request() req) {
    return req.user;
  }

  @Get('logout')
  @UseGuards(AuthGuard('local'))
  async logout(@Request() req, @Response() res) {
    req.logout({}, function (err: Error) {
        if (err) {
          throw new Error('Logout failed: Function not implemented.');
        }
        res.send("Logged out");
    } as any);
    console.log("logged out")
    return res.send("logged out");
  }

  @Get('session')
  async session(@Request() req, @Response() res) {
    const {message, status} = this.authService.getSession(req);
    res.status(status);
    res.send(message);
  }
}

