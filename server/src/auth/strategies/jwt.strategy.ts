import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_SECRET ||
        'DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.', //randomBytes(32).toString('hex'),
    });
  }

  async validate(payload: any) {
    //return payload // for debugging purposes
    // cast userId to string in case it is a number
    // Backward compatibility for userId as number v3.0.0
    if (typeof payload.userId === 'number') {
      payload.userId = payload.userId.toString();
    }
    return { 
      userId: payload.userId, 
      username: payload.username,
      role: payload.role,
      userGroups: payload.userGroups
    };
  }
}
