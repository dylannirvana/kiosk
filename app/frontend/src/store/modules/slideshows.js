import { slideshows } from '@/assets/static-data.json'
import Api from '@/api'

/* eslint-disable */
export const state = {
  all: []
}

export const getters = {
}

export const mutations = {
  setSlideshows (state, slideshows) {
    state.all = slideshows
  }
}

export const actions = {
  init ({ commit, dispatch }) {
    dispatch('getSlideshows')
    // commit('setSlideshows', slideshows)
    return slideshows
  },
  getSlideshows ({ commit }) {
    Api.get('/slideshows').then(response => {
      if (response.data.code === 200) {
        commit('setSlideshows', response.data.result.Output.slideshows)
      } else {
        console.log('error when getting slideshows')
      }
    })
  }
}