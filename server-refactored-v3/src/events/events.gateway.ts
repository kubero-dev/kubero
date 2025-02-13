import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  constructor() {
    Logger.debug('EventsGateway created');
  }

  @SubscribeMessage('join')
  handleJoin(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ): void {
    Logger.debug('joining room ' + data.room);
    client.join(data.room);
  }

  @SubscribeMessage('leave')
  handleLeave(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ): void {
    Logger.debug('leaving room ' + data.room);
    client.leave(data.room);
  }

  @SubscribeMessage('log')
  handleEvent(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): string {
    Logger.debug('received event ' + data);
    return data;
  }

  sendEvent(event: string, data: any) {
    this.server.emit(event, data);
  }

  sendLogline(room: string, logline: any) {
    //TODO define logline type
    this.server.to(room).emit('log', logline);
  }
}
