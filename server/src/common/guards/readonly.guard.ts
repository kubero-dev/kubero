import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  Logger,
} from '@nestjs/common';

/* DEPRECATED: This guard is deprecated and will be removed in future versions in favour of Kubero roles*/
@Injectable()
export class ReadonlyGuard implements CanActivate {
  private logger = new Logger(ReadonlyGuard.name);
  canActivate(context: ExecutionContext): boolean {
    if (process.env.KUBERO_READONLY === 'true') {
      this.logger.warn(
        'Kubero is in read-only mode, write operations are blocked',
      );
      this.logger.warn(
        "KUBERO_READONLY is deprecated! Use Kubero's RBAC feature instead.",
      );
      throw new HttpException('Kubero is in read-only mode', 202);
    }
    return true;
  }
}
