import {
  Controller,
  Request,
  UseGuards,
  Post,
  Get,
  Response,
  Session,
  All,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LocalGuard } from './local.guard';
@Controller({ path: 'api/auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('methods')
  async getMethods() {
    return this.authService.getMethods();
  }

  //@UseGuards(AuthGuard('local'))
  @UseGuards(LocalGuard)
  @All('login')
  async login(@Request() req, @Session() session: Record<string, any>) {
    //session.user = req.user;

    //console.log('user:', req.user);
    //const user = this.authService.validateUser(req.user.username, req.user.password);
    //req.logIn(user, err => {
    //  console.log('logged in');
    //});
    
    return req.user;
  }

  @Get('/test')
  //@UseGuards(AuthGuard(['local']))
  @UseGuards(LocalGuard)
  getHello(@Request() req) {
    console.log('getHello');

    return req;
    //return req.user + ' ' + req.authenticated + ' ' + req.isAuthenticated();  
  }

  //@UseGuards(AuthGuard('local'))
  @Get('logout')
  async logout(@Request() req, @Response() res) {
    req.logout({}, function (err: Error) {
      if (err) {
        throw new Error('Logout failed: Function not implemented.');
      }
      //res.send('Logged out');
    } as any);
    console.log('logged out');
    //return res.send('logged out');
    return res.status(200).send('logged out');
  }

  @Get('session')
  @UseGuards(AuthGuard(['local']))
  async session(@Request() req, @Response() res) {
    console.log('session');
    const { message, status } = this.authService.getSession(req);
    res.status(status);
    res.send(message);
  }
}
