import { ConsoleLogger } from '@nestjs/common'

/**
 * A custom logger that disables all logs emitted by calling `log` method if
 * they use one of the following contexts:
 * - `InstanceLoader`
 * - `RoutesResolver`
 * - `RouterExplorer`
 * - `NestFactory`
 */
export class CustomConsoleLogger extends ConsoleLogger {
  static contextsToIgnore = [
    'InstanceLoader',
    'RoutesResolver',
    'RouterExplorer',
    //'NestFactory', // I prefer not including this one
    //'NestApplication',
    //'WebSocketsController',
  ]

  log(_: any, context?: string): void {
    context = context || ''
    if (!CustomConsoleLogger.contextsToIgnore.includes(context)) {
      super.log.apply(this, arguments)
    }
  }
}