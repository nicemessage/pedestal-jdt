import Vue from 'vue'
import VueRouter from 'vue-router'


Vue.use(VueRouter)

const URL_CONTEXT = '/pedestal';

const routes = [

]

const router = new VueRouter({
  base: URL_CONTEXT,
  mode: 'history',
  routes
})

export default router
