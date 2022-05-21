import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import vueSocketIoExtended from './plugins/vue-socket-io-extended';
import router from './router';

Vue.config.productionTip = false
Vue.use(VueRouter)

new Vue({
  vueSocketIoExtended,
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
