/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */


import VueSocketIOExt from 'vue-socket.io-extended';
import io from 'socket.io-client';

const socket = io();


// Plugins
import vuetify from './vuetify'
import router from '../router'

// Types
import type { App } from 'vue'

export function registerPlugins (app: App) {
  app
    .use(VueSocketIOExt, socket)
    .use(vuetify)
    .use(router)
}
