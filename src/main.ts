import Vue from 'vue'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import VueCookies from 'vue-cookies'
import VueRouter from 'vue-router'
import PipelinePanel from '@/components/PipelinePanel.vue'
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
      component: PipelinePanel,
      props: {
        activePanel: 'details'
      }
    },
    {
      path: '/:activePanel',
      name: 'page',
      component: PipelinePanel,
      props: true
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.name === 'home') {
    next()
  } else if (to.name === 'page' && pages.has(to.params.activePanel)) {
    next()
  } else {
    next('/')
  }
})

new Vue({
  router: router,
  render: h => h(App)
}).$mount('#app')
