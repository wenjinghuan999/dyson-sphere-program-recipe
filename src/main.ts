import Vue from 'vue'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import VueCookies from 'vue-cookies'
import VueRouter from 'vue-router'
import RouterView from '@/components/RouterView.vue'
import App from './App.vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'bootstrap-vue/dist/bootstrap-vue-icons.min.css'

Vue.use(BootstrapVue)
Vue.use(IconsPlugin)
Vue.use(VueCookies)
Vue.use(VueRouter)

Vue.config.productionTip = false

const pages = new Set(['graph', 'details', 'summary'])

const router = new VueRouter({
  routes: [
    {
      path: '/',
      name: 'home',
      component: RouterView,
      props: (route) => ({
        activePanel: 'details',
        planData: route.query.plan,
        targetsData: route.query.target
      })
    },
    {
      path: '/:activePanel',
      name: 'page',
      component: RouterView,
      props: (route) => ({
        activePanel: route.params.activePanel,
        planData: route.query.plan,
        targetsData: route.query.target
      })
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.name === 'home') {
    next()
  } else if (to.name === 'page' && pages.has(to.params.activePanel)) {
    next()
  } else if (to.fullPath === from.fullPath) {
    next(false)
  } else {
    next('/')
  }
})

new Vue({
  router: router,
  render: h => h(App)
}).$mount('#app')
