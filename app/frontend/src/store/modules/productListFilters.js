import Helpers from '@/services/helpers-service'
import { filterList } from '@/assets/static-data.json'

/* eslint-disable */
export const state = {
  activeSort: '',
  activeFilters: [],
  dynamicFilterList: [],
}

export const mutations = {
  setFilterList (state, dynamicFilterList) {
    state.dynamicFilterList = dynamicFilterList
  },
  setActiveFilters (state, activeFilters) {
    state.activeFilters = activeFilters
  },
  setActiveSort (state, activeSort) {
    state.activeSort = activeSort
  }
}

export const actions = {
  setFilterList ({ commit, rootState, state }, activeFilterOptions) {
    const categoryHandle = rootState.productList.query.category
    const searchValue = rootState.productList.query.search

    if (!activeFilterOptions && searchValue === '' && categoryHandle !== 'our-designers') { 
      activeFilterOptions = rootState.categories.formatted[categoryHandle].activeFilterOptions 
    } else if (searchValue !== '' || categoryHandle === 'our-designers') {
      activeFilterOptions = Helpers.generateActiveFilterOptions(rootState.productList.activeProducts)
    }

    let dynamicFilterList = filterList.map(filter => {
      if (activeFilterOptions[filter.optionKey] && filter.dynamic) filter.options = activeFilterOptions[filter.optionKey]
      return filter
    })

    dynamicFilterList = Helpers.hideUnavailableFilters(dynamicFilterList, activeFilterOptions)
    commit('setFilterList', dynamicFilterList)
  },
  setActiveFilters ({ commit, state, dispatch }, payload) {
    commit('setActiveFilters', payload)
    dispatch('productList/setFilteredProducts', '', { root:true })
    
    dispatch('hideUnavailableFilters')
  },
  hideUnavailableFilters ({ commit, rootState, state, dispatch }, addingToActiveFilters) {
    const exemptFilterLabels = [...state.activeFilters].map(filter => filter.split(':')[0])
    const activeFilterOptions = Helpers.generateActiveFilterOptions(rootState.productList.filteredProducts)
    let dynamicFilterList = [...state.dynamicFilterList]
    dynamicFilterList = Helpers.hideUnavailableFilters(dynamicFilterList, activeFilterOptions, exemptFilterLabels)
    commit('setFilterList', dynamicFilterList)
  },
  setActiveSort ({ commit, state, dispatch }, payload) {
    commit('setActiveSort', payload)
    dispatch('productList/setFilteredProducts', '', { root:true })
  }
}

