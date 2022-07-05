import debug from 'debug';
debug('app:socket')

import { Server as HttpServer } from 'http';
import { Server } from "socket.io";

export function init(httpServer: HttpServer) {
    debug('initializing');

    const io = new Server(httpServer, { /* options */ });
    console.log('socket.io started')
    io.on('connection', client => {
        console.log('socket.io connected')
        //return {client: client, io: io};

        client.on('join', join => {
            //leave all rooms before joining new one
            client.rooms.forEach(room => {
                if(client.id !== room && room !== join.room) {
                    console.log('exiting room : ' +room)
                    client.leave(room);
                }
            })
            console.log('joining room', join.room)
            client.join(join.room);
            //console.log(client.rooms.values())
        });

        client.on('leave', leave => {
            console.log('leaving room', leave.room)
            client.leave(leave.room);
        });
    });
    return io;
}



