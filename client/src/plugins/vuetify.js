import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';
//import colors from 'vuetify/es5/util/colors'

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    dark: false,
    themes: {
      dark: {
        primary: '#8560A9',
        //cardBackground: '#', // use default
        navBG: '#262626',

        secondary: '#b0bec5',
        accent: '#8c9eff',
        error: '#b71c1c',
      },
      light: {
        primary: '#8560A9',
        cardBackground: '#FAFAFA',
        navBG: '#F7F8FB',

        secondary: '#424242',
        accent: '#82B1FF',
        error: '#FF5252',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FFC107',
      },
    },
  },
});
/*
export default new Vuetify({
    theme: {
      dark: true,
      themes: {
        light: {
          primary: colors.purple,
          secondary: colors.grey.darken1,
          accent: colors.shades.black,
          error: colors.red.accent3,
          background: colors.indigo.lighten5,
        },
        dark: {
          primary: colors.blue.lighten3,
          background: colors.indigo.base,
        },
      },
    },
});
*/