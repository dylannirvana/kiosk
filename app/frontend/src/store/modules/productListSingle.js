/* eslint-disable */
export const state = {
  selectedProduct: {},
  selectedProductIndex: 0,
  activeVarient: {},
  screenSize: '',
  screenHeight: '',
  screenWidth: '',

}

export const mutations = {
  setSelectedProduct (state, selectedProduct) {
    state.selectedProduct = selectedProduct
  },
  setActiveVarient (state, activeVarient) {
    state.activeVarient = activeVarient
  },
  setScreenSize (state, screenSize) {
    state.screenSize = screenSize
  },
  setScreenHeight (state, screenHeight) {
    state.screenHeight = screenHeight
  },
  setScreenWidth (state, screenWidth) {
    state.screenWidth = screenWidth
  },
  setSelectedProductIndex (state, index) {
    state.selectedProductIndex = index
  },
  setSelectedProductIndex (state, index) {
    state.selectedProductIndex = index
  }
}

export const actions = {
  setSelectedProduct ({ commit, rootState }, selectedProductBaseCode) {
    const products = [].concat.apply([], rootState.productList.paged.products)
    const selectedProductIndex = products.map(product => product.base_code).indexOf(selectedProductBaseCode)
    commit('setSelectedProductIndex', selectedProductIndex)
    commit('setSelectedProduct', products[selectedProductIndex])
    commit('setActiveVarient', products[selectedProductIndex].variations[0])

    return products[selectedProductIndex]
  },
  setActiveVarient ({ commit }, activeVarient) {
    commit('setActiveVarient', activeVarient)
    return activeVarient
  },

  setScreenSize ({ commit }, screenSize) {
    commit('setScreenSize', screenSize)
    commit('setScreenHeight', parseInt(screenSize) === 55 ? 47.7 : 85)
    commit('setScreenWidth', parseInt(screenSize) === 55 ? 26.94 : 47.8125)

    return screenSize
  },
  nextProduct ({ commit, rootState, state }, { router, path }) {
    const products = [].concat.apply([], rootState.productList.paged.products)
    const nextProduct = products[state.selectedProductIndex + 1]
    
    if (state.selectedProductIndex === products.length - 1) return // return if last product
    router.push(path.replace(state.selectedProduct.base_code, nextProduct.base_code))    
  },
  prevProduct ({ commit, rootState, state }, { router, path }) {
    const products = [].concat.apply([], rootState.productList.paged.products)
    const nextProduct = products[state.selectedProductIndex - 1]
    
    if (state.selectedProductIndex === 0) return // Return if first product
    router.push(path.replace(state.selectedProduct.base_code, nextProduct.base_code))  
  }
}
