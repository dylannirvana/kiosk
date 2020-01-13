/* eslint-disable */
export const state = {
  message: '',
  type: ''
}

export const getters = {
}

export const mutations = {
  setMessage (state, payload) {
    state.message = payload
  },
  setType (state, payload) {
    state.type = payload
  }
}

export const actions = {
  setAlert ({ commit }, {message, type}) {
    commit('setMessage', message)
    commit('setType', type)

    setTimeout(() => {
      commit('setMessage', '')
      commit('setType', '')
    }, 3000)
  }
}
  