import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import vueSocketIoExtended from './plugins/vue-socket-io-extended';
import router from './router';

Vue.config.productionTip = false
Vue.use(VueRouter)

// vcdount is created in index.html by loadin js from CDN
//https://www.npmjs.com/package/vue-css-donut-chart
// eslint-disable-next-line no-undef
Vue.use(vcdonut.default);

new Vue({
  vueSocketIoExtended,
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
