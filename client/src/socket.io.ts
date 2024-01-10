import io from 'socket.io-client';

export const useSocketIO = () => {
    const socket = io()
    return {
        socket,
    }
}