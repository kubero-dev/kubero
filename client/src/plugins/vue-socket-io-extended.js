import Vue from 'vue';
import VueSocketIOExt from 'vue-socket.io-extended';
import { io } from 'socket.io-client';

const socket = io();

Vue.use(VueSocketIOExt, socket);

export default {
    sockets: {
        connect() {
            console.log('socket connected');
        }
    }
}