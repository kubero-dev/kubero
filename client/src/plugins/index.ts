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
