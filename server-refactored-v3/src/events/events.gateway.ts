import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsResponse,
  } from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})

export class EventsGateway {
  @WebSocketServer()
  server: Server;

  // TODO: example implementation of a WebSocket event
  @SubscribeMessage('events')
  findAll(@MessageBody() data: any): Observable<WsResponse<number>> {
      return from([1, 2, 3]).pipe(map(item => ({ event: 'events', data: item })));
  }

  sendEvent(event: string, data: any) {
    this.server.emit(event, data);
  }

  sendLogline(room: string, logline: any) { //TODO define logline type
    this.server.to(room).emit('log', logline);
  }
}