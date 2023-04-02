import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';
import colors from 'vuetify/es5/util/colors'

Vue.use(Vuetify);

// selct theme by time of day
function getTheme() {
  const hours = new Date().getHours();
  return hours > 7 && hours < 19 ? 'false' : 'true';
}


export default new Vuetify({
  theme: {
    dark: getTheme(),
    themes: {
      dark: {
        primary: '#8560A9',
        //cardBackground: '#', // use default
        navBG: '#262626',
        secondary: colors.grey.darken3,
        background: '#121212',

        //secondary: '#b0bec5',
        accent: '#8c9eff',
        error: '#b71c1c',
      },
      light: {
        primary: '#8560A9',
        cardBackground: '#FAFAFA',
        navBG: '#F7F8FB',

        secondary: colors.grey.lighten2,
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