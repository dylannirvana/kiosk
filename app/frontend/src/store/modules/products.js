import Api from '@/api'
// import sampleProducts from '@/assets/sample-products.json'

/* eslint-disable */
export const state = {
  all: [],
  byCategory: {},
  loaded: false,
  searchableKeys: [
    {
      key: 'base_code',
      root: true,
      type: String
    },
    {
      key: 'name',
      root: true,
      type: String
    },
    {
      key: 'sku',
      type: String,
      root: 'variations',
      rootType: Array
    },
    {
      key: 'noHeight',
      type: String,
      root: true
    }
  ]
}

export const getters = {
  getProducts (state) {
    return (query) => state.all.filter(product => {
      // If no query is passed in, return all products
      if (!query) return true

      // If a query is passed in, look for matches, and return filtered products
      let matches = []
      for (let key in query) {
        matches.push(product[key] === query[key])
      }
      return matches.includes(true)
    })
  },
  searchProducts (state) {
    return (query) => state.all.filter(product => {
      const fiterString = state.searchableKeys.map(keyObj => {
        const keyRoot = keyObj.root === true ? product : product[keyObj.root]
        if (keyObj.rootType === Array) {
          return keyRoot.map(item => item[keyObj.key]).join()
        }
        return keyRoot[keyObj.key]
      }).join().toLowerCase()
      return fiterString.includes(query.toLowerCase())
    })
  }
}

export const mutations = {
  setProducts (state, products) {
    state.all = products
  },
  setProductsByCategory (state, productsByCategory) {
    state.byCategory = productsByCategory
  },
  setLoaded (state, loaded) {
    state.loaded = loaded
  }
}

export const actions = {
  init ({commit, dispatch}) {
    dispatch('getProducts')
  },
  getProducts ({ commit , state, rootState, dispatch}, payload) {
    const categories = 'ceiling, fans, floor, outdoor, table, wall'
    
    return Api.get('/products').then(response => {
      const products = response.data.result.Output
      let productsByCategory = {}
      products.map((product, index) => {
        const productCategory = product.category_main.toLowerCase()
        if (!categories.includes(productCategory)) return
        if (!productsByCategory[productCategory]) {
          productsByCategory[productCategory] = [product]
        } else {
          productsByCategory[productCategory].push(product)
        }
      })

      let productsWithNoHeight = products.filter(product => {
        return !product.variations.map(variation => {
          return !Object.entries(variation.z_criteria).map(criteria => {
            return criteria[0] === 'height' || criteria[0] === 'fixture height' || criteria[0] === 'min. custom height'
          }).includes(true) || !(!variation.chain_length) && variation.category !== 'Ceiling'
        }).includes(false)
      })
      productsWithNoHeight = productsWithNoHeight.map(product => {
        product.noHeight = 'No Height'
        return product
      })
      products.sort((a, b) => a.sort_order - b.sort_order)
      commit('setProducts', products)
      commit('setLoaded', true)
      commit('setProductsByCategory', productsByCategory)
    })
  },

  getProductsByCategory ({ commit , state, rootState, dispatch}, label) {
    Api.get(`/products?category=${label}`).then(response => {
      const products = response.data.result.Output

      let productsWithNoHeight = products.filter(product => {
        return !product.variations.map(variation => {
          return !Object.entries(variation.z_criteria).map(criteria => {
            return criteria[0] === 'height' || criteria[0] === 'fixture height' || criteria[0] === 'min. custom height'
          }).includes(true) || !(!variation.chain_length) && variation.category !== 'Ceiling'
        }).includes(false)
      })
      productsWithNoHeight = productsWithNoHeight.map(product => {
        product.noHeight = 'No Height'
        return product
      })
      commit('setProductsByCategory', {
        products: products,
        category: label
      })
    })
  }
}