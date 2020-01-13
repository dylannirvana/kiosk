import Helpers from '@/services/helpers-service'

/* eslint-disable */
export const state = {
  activeProducts: [],
  filteredProducts: [],
  singleViewIsActive: false,
  imageSizeState: 'fitScreen', // lifeSize, fitScreen
  viewState: 'listView', // listView, isAnimatingToSingleView, singleView
  fullSizeButtonVisible: false,

  paged: {
    currentPage: 1,
    countPerPage: 20,
    totalPages: 0,
    products: []
  },

  query: {
    category: '',
    subCategory: '',
    search: ''
  }
}

export const getters = {
  getProducts (state) {
    return (query) => state.activeProducts.filter(product => {
      // If no query is passed in, return all products
      if (!query) return true

      // If a query is passed in, look for matches, and return filtered products
      let matches = []
      for (let key in query) {
        matches.push(product[key] === query[key])
      }
      return matches.includes(true)
    })
  }
}

export const mutations = {
  setActiveProducts (state, activeProducts) {
    state.activeProducts = activeProducts
  },
  setSingleViewIsActive (state, singleViewIsActive) {
    state.singleViewIsActive = singleViewIsActive
  },
  setFullSizeButtonVisible (state, fullSizeButtonVisible) {
    state.fullSizeButtonVisible = fullSizeButtonVisible
  },
  setImageSizeState (state, imageSizeState) {
    state.imageSizeState = imageSizeState
  },
  setViewState (state, viewState) {
    state.viewState = viewState
  },
  setFilteredProducts (state, products) {
    state.filteredProducts = products
  },
  setPagedProducts(state, paginatedProducts) {
    state.paged.products = paginatedProducts
  },
  setTotalPages (state, totalPages) {
    state.paged.totalPages = totalPages
  },
  setCurrentPage (state, currentPage) {
    state.paged.currentPage = currentPage
  },
  setQuery (state, querySettings) {
    state.query = querySettings
  }
}

export const actions = {
  setActiveProducts ({ commit, state, rootState, rootGetters, dispatch }) {
    // Here we set the active products, based on the query provided by the active route, before any filters have been applied.
    // This can be all products in category
    // All products in Sub Category
    // All products withing search query
    const { category, subCategory, search } = state.query
    let products = rootState.products.all
    if (category && category !== 'our-designers') products = rootState.products.byCategory[category]
    if (subCategory && category !== 'our-designers') {
      products = !products ? products : products.filter(product => subCategory === 'new-intros' ? product.variations.map(variation => parseInt(variation.new_item)).includes(1) : product.category_sub.toLowerCase().replace(' ', '-') === subCategory)
    } else if (subCategory && category === 'our-designers') {
      products = rootState.products.all.filter(product => {
        const designers = product.filterValues.filter(value => value.includes('designer')).map(value => value.split(':')[1].toLowerCase().replace('-', ' '))
        return designers.includes(subCategory.replace('-', ' '))
      })      
    }
    if (search) products = rootGetters['products/searchProducts'](search)


    products = products ? products.sort((a, b) => {
      const aOrder = a.sort_order * 1000000000
      const bOrder = b.sort_order * 1000000000
      return aOrder === bOrder ? 0 : (aOrder < bOrder ? -1 : 1)
    }) : products

    commit('setActiveProducts', products)
    dispatch('setPagedProducts', products)
    return products
  },

  setSingleViewIsActive ({commit}, payload) {
    commit('setSingleViewIsActive', payload)
  },

  setFullSizeButtonVisible ({commit}, payload) {
    commit('setFullSizeButtonVisible', payload)
  },

  setImageSizeState ({commit}, payload) {
    commit('setImageSizeState', payload)
  },

  setViewState ({commit}, payload) {
    commit('setViewState', payload)
  },

  setFilteredProducts ({ commit, rootState, state, dispatch }, payload) {
    // Here we set the filtered products based on the active filters set by the client
    let products = state.activeProducts

    if (rootState.productListFilters.activeFilters.length > 0) {
      products = Helpers.filterProducts({
        products: products, 
        activeFilters: rootState.productListFilters.activeFilters
      })
    }

    if (rootState.productListFilters.activeSort === 'price-asc') {
      products.sort((a, b) => {
        return a.variations[0].price * 100000 - b.variations[0].price * 100000
      })
    }

    if (rootState.productListFilters.activeSort === 'price-des') {
      products.sort((a, b) => {
        return b.variations[0].price * 100000 - a.variations[0].price * 100000
      })
    }

    commit('setCurrentPage', 1)
    commit('setFilteredProducts', products)
    dispatch('setPagedProducts', products)
    return products
  },
  setPagedProducts({ commit, state, dispatch }, products) {
    let pagedProducts = []
    const totalPages = Math.ceil(products.length / state.paged.countPerPage)
    for (let pageNumber = 0; pageNumber < totalPages; pageNumber++) {
      const page = products.slice(pageNumber * state.paged.countPerPage, (pageNumber + 1) * state.paged.countPerPage)
      pagedProducts.push(page)
    }
    commit('setPagedProducts', pagedProducts)
    dispatch('setTotalPages')
    return pagedProducts
  },
  setCurrentPage ({ commit }, page) {
    commit('setCurrentPage', page)
    return page
  },
  setTotalPages ({ commit, state }) {
    const totalPages = state.paged.products.length
    commit('setTotalPages', totalPages)
  },
  setQuery ({ commit, state, rootState, dispatch }, querySettings) {
    commit('setQuery', querySettings)
    commit('setCurrentPage', 1)
    dispatch('setActiveProducts')

    dispatch('productListFilters/setActiveFilters', [], { root: true })
    dispatch('productListFilters/setActiveSort', '', { root: true })
    dispatch('productListFilters/setFilterList', '', { root: true })

    return querySettings
  },
  nextPage ({ commit, state }) {
    const nextPage = state.paged.currentPage + 1
    const currentPage = nextPage > state.paged.totalPages ? state.paged.currentPage : nextPage
    commit('setCurrentPage', currentPage)
  },
  prevPage ({ commit , state }) {
    const prevPage = state.paged.currentPage - 1
    const currentPage  = prevPage < 1 ? state.paged.currentPage : prevPage
    commit('setCurrentPage', currentPage)
  }
}

