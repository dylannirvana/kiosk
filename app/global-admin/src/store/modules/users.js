import Api from '@/api'
/* eslint-disable */
export const state = {
  current: {},
  all: [
    {
      firstName: 'Rita',
      lastName: 'Leite',
      location: 'New York',
      email: 'rita@gmail.com'
    },
    {
      firstName: 'Elsi',
      lastName: 'Hansdottir',
      location: 'Chicago',
      email: 'elsi@gmail.com'
    },
    {
      firstName: 'Rita',
      lastName: 'Leite',
      location: 'New York',
      email: 'rita@gmail.com'
    },
    {
      firstName: 'Elsi',
      lastName: 'Hansdottir',
      location: 'Chicago',
      email: 'elsi@gmail.com'
    },
    {
      firstName: 'Rita',
      lastName: 'Leite',
      location: 'New York',
      email: 'rita@gmail.com'
    },
    {
      firstName: 'Elsi',
      lastName: 'Hansdottir',
      location: 'Chicago',
      email: 'elsi@gmail.com'
    }
  ]
}

export const getters = {
}

export const mutations = {
  setAuthorizeUser (state, payload) {
    state.isAuthorized = true
  },
  setAll (state, payload) {
    state.all = payload
  },
  setCurrent (state, payload) {
    state.current = payload
  }
}

export const actions = {
  authorizeUser ({ commit }, payload) {
    commit('setAuthorizeUser', payload)
  },
  getAll ({ commit, rootState }, payload) {
    Api.get('/user/all', true).then(response => {
      if (response.data.code === 200) {
        const users = response.data.result.Output
        const currentUser = users.filter(user => user.username === rootState.auth.username)[0]
        commit('setCurrent', currentUser)
        commit('setAll', users)
      } else {
        console.log('error when getting slideshows')
      }
    })
  }
}
