// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import store from '@/store'
import router from './router'
import '@/elements'
import moment from 'moment'

Vue.config.productionTip = false

Vue.filter('formatDate', (value) => {
  if (value) {
    return moment(String(value)).format('MM/DD/YYYY hh:mm')
  }
  return value
})

Vue.filter('capitalize', (value) => {
  if (value) {
    return value.charAt(0).toUpperCase() + value.slice(1)
  }
  return value
})

Vue.filter('handlize', (value) => {
  if (value) {
    return value.toLowerCase().replace(' ', '-')
  }
  return value
})

Vue.filter('price', (value) => {
  if (value) {
    const preDecimal = value.split('.')[0]
    const postDecimal = value.split('.')[1] ? value.split('.')[1] : '00'
    return '$' + preDecimal.replace(/(\d)(?=(\d{3})+$)/g, '$1,') + '.' + postDecimal
  }
  return value
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
