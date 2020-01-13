import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store'

import Collections from '@/containers/Collections'
import Collection from '@/containers/Collection'
import Admin from '@/containers/Admin'
import ProductDetails from '@/containers/ProductDetails'
import AdminSlideshows from '@/containers/AdminSlideshows'
import Slideshow from '@/containers/Slideshow'
import Logs from '@/containers/Logs'
import Login from '@/containers/Login'
import Search from '@/containers/Search'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      redirect: '/collections'
    },
    {
      path: '/auth/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/search/:query',
      name: 'Search',
      component: Search,
      children: [
        {
          name: 'SearchProduct',
          path: '/search/:query/:baseCode',
          component: ProductDetails
        }
      ]
    },
    {
      path: '/admin',
      name: 'Admin',
      component: Admin,
      redirect: '/admin/slideshows',
      children: [
        {
          name: 'AdminSlideshows',
          path: '/admin/slideshows',
          component: AdminSlideshows,
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
    },
    {
      path: '/collections',
      name: 'Collections',
      component: Collections
    },
    {
      path: '/collection/:collectionHandle',
      redirect: '/collection/:collectionHandle/view-all'
    },
    {
      path: '/collection/:collectionHandle/:subCollectionHandle',
      name: 'Collection',
      component: Collection,
      children: [
        {
          name: 'Product',
          path: '/collection/:collectionHandle/:subCollectionHandle/:baseCode',
          component: ProductDetails
        }
      ]
    },
    {
      path: '/slideshows',
      redirec: '/slideshows/1'
    },
    {
      name: 'Slideshow',
      path: '/slideshows/:id',
      component: Slideshow
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

export default router
