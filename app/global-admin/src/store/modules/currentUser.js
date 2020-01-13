/* eslint-disable */
export const state = {
  isAuthorized: true,
  role: 'admin'
}

export const getters = {
}

export const mutations = {
  setAuthorizeUser (state, payload) {
    state.isAuthorized = true
  }
}

export const actions = {
  authorizeUser ({ commit }, payload) {
    commit('setAuthorizeUser', payload)    
  }
}
