import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/element';
import http from './util/http';


// bi
// import './assets/scss/bi/base.scss'

import './assets/icons/iconfont.css'

import 'element-ui/lib/theme-chalk/index.css';

import masterActions from './micro/masterActions';
import subMenus from './subMenus';
import '@/assets/scss/newPortal.scss';

// import "./assets/scss/index.scss";
// import './assets/scss/element-reset.scss'

import 'babel-polyfill';

Vue.use(subMenus);
Vue.use(masterActions);
Vue.config.productionTip = false


Vue.prototype.$http = http;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#pedestal-app')
