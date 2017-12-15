import Vue from 'vue'
import VueRouter from 'vue-router'

import categories from '../categories'
import proxyknifeStore from '../main-store'

Vue.use(VueRouter)

function load (component) {
  // '@' is aliased to src/components
  return () => import(`../components/${component}.vue`)
}

let routes = []

let proxyknife = {
  path: '/',
  component: load('layout'),
  children: [
    {
      path: '',
      component: load('proxyknife/home'),
      meta: {
        title: 'Proxy Knife',
        hash: '/proxyknife',
        icon: 'layers',
        backRoute: '/'
      }
    }
  ]
}

function component (path, config) {
  return {
    path,
    meta: config,
    component: load(path)
  }
}
categories.forEach(category => {
  if (category.extract) {
    return
  }
  category.features.forEach(feature => {
    let path = category.hash + '/' + feature.hash

    if (!feature.tabs) {
      proxyknife.children.push(component(path, feature))
      return
    }

    feature.tabs.forEach(tab => {
      let subpath = path + '/' + tab.hash
      proxyknife.children.push(component(subpath, {
        title: tab.title,
        hash: '/' + path,
        iframeTabs: feature.iframeTabs,
        icon: feature.icon,
        tabs: feature.tabs
      }))
    })

    routes.push({
      path: '/' + path,
      redirect: '/' + path + '/' + feature.tabs[0].hash
    })
  })
})

routes.push(proxyknife)
routes.push({path: '*', component: load('Error404')})

const Router = new VueRouter({
  scrollBehavior: () => ({ y: 0 }),
  routes
})

Router.beforeEach((to, from, next) => {
  if (to.meta) {
    proxyknifeStore.set(to.meta)
  }
  next()
})

export default Router
