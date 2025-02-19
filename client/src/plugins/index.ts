/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import vuetify from './vuetify'
import router from '../router'
import pinia from './pinia'
import vCodeBlock from './code-block'
/*
import axios from 'axios'
axios.defaults.headers.common['User-Agent'] = 'Kubero/3.x'
axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('kubero.JWT_TOKEN')
*/
// Types
import type { App } from 'vue'

export function registerPlugins (app: App) {
  app
    .use(pinia)
    // @ts-ignore: Type missmatch
    .use(vCodeBlock)
    .use(vuetify)
    .use(router)
}
