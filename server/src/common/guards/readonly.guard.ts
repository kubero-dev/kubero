import { CanActivate, ExecutionContext, Injectable, HttpException, Logger } from '@nestjs/common';

@Injectable()
export class ReadonlyGuard implements CanActivate {
  private logger = new Logger(ReadonlyGuard.name);
  canActivate(context: ExecutionContext): boolean {
    if (process.env.KUBERO_READONLY === 'true') {
      this.logger.warn('Kubero is in read-only mode, write operations are blocked');
      throw new HttpException('Kubero is in read-only mode', 202);
    }
    return true;
  }
}