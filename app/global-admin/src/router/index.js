import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store'

import Admin from '@/containers/Admin'
import Dashboard from '@/containers/Dashboard'
import SlideshowsCreate from '@/containers/SlideshowsCreate'
import SlideshowsEdit from '@/containers/SlideshowsEdit'
import Logs from '@/containers/Logs'
import Auth from '@/containers/Auth'
import AuthLogin from '@/containers/AuthLogin'
import AuthReset from '@/containers/AuthReset'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      redirect: '/auth/login'
    },
    {
      path: '/auth',
      name: 'Auth',
      component: Auth,
      children: [
        {
          name: 'Login',
          path: '/auth/login',
          component: AuthLogin
        },
        {
          name: 'ResetPassword',
          path: '/auth/reset',
          component: AuthReset
        }
      ]
    },
    {
      path: '/slideshows/create',
      name: 'SlideshowsCreate',
      meta: {
        auth: true
      },
      component: SlideshowsCreate
    },
    {
      path: '/slideshows/edit/:id',
      name: 'SlideshowsEdit',
      meta: {
        auth: true
      },
      component: SlideshowsEdit
    },
    {
      path: '/admin',
      name: 'Admin',
      component: Admin,
      redirect: '/admin/dashboard',
      meta: {
        auth: true
      },
      children: [
        {
          name: 'Dashboard',
          path: '/admin/dashboard',
          component: Dashboard,
          meta: {
            auth: true
          }
        },
        {
          name: 'Logs',
          path: '/admin/logs',
          component: Logs,
          meta: {
            auth: true
          }
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.meta.auth) {
    if (!store.state.auth.isAuthorized) {
      next('/auth/login')
    }
  }
  next()
})

Vue.router = router

export default router
