/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import colors from 'vuetify/util/colors'
import i18n from './i18n'
import { createVueI18nAdapter } from 'vuetify/locale/adapters/vue-i18n'
import { useI18n } from 'vue-i18n'

// Composables
import { createVuetify } from 'vuetify'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  locale: {
    adapter: createVueI18nAdapter({ i18n, useI18n }),
  },
  theme: {
    themes: {
      dark: {
        colors: {
          "on-background": "#BBB",
          primary: '#9965cc',
          "primary-darken1": '#563774',
          secondary: '#1B1B1B',
          cardBackground: '#212121',
          "on-cardBackground": '#CCC',
          navBG: '#262626',
          kubero: '#684888',
          "on-surface-variant": "#1B1B1B",
          
          accent: '#8c9eff',
          error: '#b71c1c',

          focusbg: '#393939',
        },
      },
      light: {
        colors: {
          "on-background": "#333",
          primary: '#8560A9',
          "primary-darken1": '#8560A9',
          secondary: '#E0E0E0',
          cardBackground: '#FAFAFA',
          "on-cardBackground": '#444',
          navBG: '#F7F8FB',
          kubero: '#684888',

          accent: '#82B1FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107',

          focusbg: '#d3d3d3',
        },
      },
    },
  },
})