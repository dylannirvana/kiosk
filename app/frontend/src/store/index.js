import Vue from 'vue'
import Vuex from 'vuex'
import modules from './modules'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules
})

// Automatically run the `init` action for every module,
// if one exists.
for (const moduleName of Object.keys(modules)) {
  if (modules[moduleName].actions && modules[moduleName].actions.init) {
    store.dispatch(`${moduleName}/init`)
  }
}

export default store

// let initHasBeenCalled = false
// store.watch(() => {
//   const dataHasLoaded = store.state.products.all.length > 0
//   if (dataHasLoaded && !initHasBeenCalled) {
//   }
// })
// // Automatically run the `init` action for every module,
// // if one exists.
// for (const moduleName of Object.keys(modules)) {
//   if (modules[moduleName].actions && modules[moduleName].actions.init) {
//     store.dispatch(`${moduleName}/init`)
//   }
// }
