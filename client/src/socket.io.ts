import io from 'socket.io-client';

export const useSocketIO = (token: string) => {
    let socketOptions = {
        autoConnect: true,
        auth: {}
    };

    // Do not use authentication when token is empty
    if (token !== '') {
        socketOptions.auth = {
            token: token,
        };
        //console.log('socket.io auth :::: ', token);
    }

    const socket = io(socketOptions);
    return {
        socket,
    }
}