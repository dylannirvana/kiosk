import Api from '@/api'

/* eslint-disable */
export const state = {
  all: []
}

export const getters = {
}

export const mutations = {
  setLogs (state, logs) {
    state.all = logs
  }
}

export const actions = {
  getLogs ({ commit }) {
    return Api.get('/log/view', true).then(response => {
      if (response.data && response.data.code === 200) {
        commit('setLogs', response.data.result.Output)
        return {
          code: 200,
          msg: 'Logs Success',
          data: response.data.result.Output
        }
      } else {
        return {
          code: 401,
          msg: 'Logs Failed'
        }
      }
    })
  }
}