import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
@Injectable()
export class Session extends PassportSerializer {
  serializeUser(user: any, done: (err: any, user: any) => void,): void {
    console.log('serializeUser', user);
    done(null, user);
  }

  deserializeUser(payload: string, done: (err: any, payload: string) => void ): void {
    console.log('deserializeUser', payload);
    done(null, payload);
  }
}