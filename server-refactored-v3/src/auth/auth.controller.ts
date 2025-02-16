import {
  Controller,
  Request,
  UseGuards,
  Post,
  Get,
  Response,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller({ path: 'api/auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('methods')
  async getMethods() {
    return this.authService.getMethods();
  }
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.body);
  }

  @Get('logout')
  @UseGuards(AuthGuard('local'))
  async logout(@Request() req) {
    req.logout({}, function (err: Error) {
      if (err) {
        throw new Error('Logout failed: Function not implemented.');
      }
      return { message: 'logged out', status: 200 };
    } as any);
    console.log('logged out');
    return { message: 'logged out', status: 200 };
  }

  @Get('session')
  async session(@Request() req, @Response() res) {
    const { message, status } = this.authService.getSession(req);
    res.status(status);
    res.send(message);
  }
}
