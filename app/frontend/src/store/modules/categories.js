
import Api from '@/api'
import { filterList } from '@/assets/static-data.json'

/* eslint-disable */
export const state = {
  formatted: {},
  filterList: {},
  loaded: false
}

export const mutations = {
  setFilterList (state, filterList) {
    state.filterList = filterList
  },
  setCategories (state, category) {
    state.formatted = category
  },
  setLoaded (state, loaded) {
    state.loaded = loaded
  }
}

export const actions = {
  init ({commit, dispatch}) {
    const storedCategories = localStorage.getItem('categories')
    if (storedCategories) {
      commit('setCategories', JSON.parse(storedCategories).data)
      commit('setLoaded', true)
    }
    Api.get('/categories').then(response => {
      let collections = response.data.result.Output.collection
      collections = collections.sort((a, b) =>  a.sort_order[0] - b.sort_order[0])
      let categories = {}
      collections.map(collection => {
        collection.subCategories.sort((a, b) => {
          if (a.label === 'View All') return -1
          return a.sort_order - b.sort_order
        })
        collection.images = [
          ...collection.images,
          ...collection.subCategories.map(subCategory => subCategory.img)
        ]
        collection.thumbnail = [
          ...collection.thumbnail,
          ...collection.subCategories.map(subCategory => subCategory.img_thumbnail)
        ]
        categories[collection.handle] = collection
      })
      commit('setCategories', categories)
      commit('setLoaded', true)
      localStorage.setItem('categories', JSON.stringify({
        timestamp: new Date().getTime(),
        data: categories
      }))
    })

    commit('setFilterList', filterList)
  }
}