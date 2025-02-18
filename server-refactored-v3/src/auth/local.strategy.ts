import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
//import { Request } from 'express';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: "username",
      passwordField: "password"
    });
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(username, password);
    console.log('validate', user);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
/*
  // onyl needed when somethins aditional should be done after the user is authenticated
  async authenticate(@Request() req, user: Express.User,  options?: any): Promise<void> {
    console.log('authenticate', options, user);
    
    //console.log('user', user);
/*
    const usera = await this.validate(req.body.username, req.body.password);
    console.log('usera', usera);
    
    
    req.login(user, err => {
      console.log('logged in');
    });


    //console.log(options, req);
    /*
    req.login(user, err => {
      console.log('logged in');
    });

    super.authenticate(req, options);
  }
/*
    try {
      const user = await this.validate(req.body.username, req.body.password);
      req.login(user, err => {
        console.log('logged in');
      });
      super.authenticate(req, options);
    } catch (error) {
      console.error(error);
      console.log('login error');
      return this.fail(error, 401);
    }
*/
  //}
}
