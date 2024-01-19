import debug from 'debug';
debug('app:socket')

import { Server as HttpServer } from 'http';
import { Server } from "socket.io";

export function init(httpServer: HttpServer) {
    debug('initializing');

    const io = new Server(httpServer, { /* options */ });

    io.use((socket, next) => {
        //if (!auth.authentication) return next(); // skip authentication if not enabled

        const token = socket.handshake.auth.token;
        console.log('socket.io auth :::: ', token);
        if (!token) return next(new Error("missing token"));
        if (token !== process.env.KUBERO_WS_TOKEN) return next(new Error("invalid token"));
        return next();
    });

    console.log('⚡️[server]: socket.io started')
    io.on('connection', client => {
        debug.debug('socket.io connected')

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
