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
  public execStreams: { [key: string]: { websocket: WebSocket; stream: any } } =
    {};

  constructor() {
    //Logger.debug('EventsGateway created');
  }

  @SubscribeMessage('join')
  handleJoin(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ): void {
    //Logger.debug('joining room ' + data.room);
    client.join(data.room);
  }

  @SubscribeMessage('leave')
  handleLeave(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ): void {
    //Logger.debug('leaving room ' + data.room);
    client.leave(data.room);
  }

  sendEvent(event: string, data: any) {
    this.server.emit(event, data);
  }

  sendLogline(room: string, logline: any) {
    //TODO define logline type
    this.server.to(room).emit('log', logline);
  }

  // sending the terminal input to the server
  @SubscribeMessage('terminal')
  handleTerminal(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ): void {
    if (this.execStreams[data.room]) {
      this.execStreams[data.room].stream.write(data.data);
    }
  }

  // sending the terminal output to the client
  sendTerminalLine(room: string, line: string) {
    this.server.to(room).emit('consoleresponse', line);
  }
}
