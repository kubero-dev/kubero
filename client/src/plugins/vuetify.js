import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';
import colors from 'vuetify/es5/util/colors'

Vue.use(Vuetify);

export default new Vuetify({
  version: "",
  isAuthenticated: false,
  buildPipeline: false,
  theme: {
    dark: false,
    themes: {
      dark: {
        primary: '#8560A9',
        //cardBackground: '#', // use default
        navBG: '#262626',
        secondary: colors.grey.darken3,
        background: '#121212',

        accent: '#8c9eff',
        error: '#b71c1c',
      },
      light: {
        primary: '#8560A9',
        cardBackground: '#FAFAFA',
        navBG: '#F7F8FB',
        secondary: colors.grey.lighten2,
        textColor: '#262626',

        accent: '#82B1FF',
        error: '#FF5252',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FFC107',
      },
    },
  },
});