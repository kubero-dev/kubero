import debug from 'debug';
debug('app:socket')

import { Server as HttpServer } from 'http';
import { Server } from "socket.io";

export function init(httpServer: HttpServer) {
    debug('initializing');

    const io = new Server(httpServer, { /* options */ });
    console.log('socket.io started')
    io.on('connection', client => {
        debug.log('socket.io connected')

        client.on('join', join => {
            //leave all rooms before joining new one
            client.rooms.forEach(room => {
                if(client.id !== room && room !== join.room) {
                    debug.log('exiting room : ' +room)
                    client.leave(room);
                }
            })
            debug.log('joining room', join.room)
            client.join(join.room);
        });

        client.on('leave', leave => {
            debug.log('leaving room', leave.room)
            client.leave(leave.room);
        });
    });
    return io;
}



