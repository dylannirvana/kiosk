import Api from '@/api'
import router from '../../router'

/* eslint-disable */
export const state = {
  isAuthorized: false,
  formKey: '',
  username: '',
  currentUser: {}
}

export const getters = {
}

export const mutations = {
  setAuthorizeUser (state, payload) {
    state.isAuthorized = payload
  },
  setFormKey (state, formKey) {
    state.formKey = formKey
  },
  setUsername (state, username) {
    state.username = username
  },
  setCurrentUser (state, currentUser) {
    state.currentUser = currentUser
  }
}

export const actions = {
  init ({ commit, dispatch }) {
    const formKey = localStorage.getItem('formKey')
    const userData = JSON.parse(localStorage.getItem('userData'))
    if (formKey) {
      commit('setUsername', userData.username)
      commit('setAuthorizeUser', true)
      commit('setFormKey', formKey)
      // ToDo: Setup check after admin logs are working
      // setTimeout(() => {
      //   dispatch('checkToken')
      // }, 100)
    }
  },
  authorizeUser ({ commit, dispatch }, payload) {
    const {username, password} = payload
    return Api.post({
      path: '/local/login',
      data: {
        username: username,
        password: password
      }
    }).then(response => {
      if (response.data && response.data.code === 200) {
        commit('setUsername', username)
        commit('setAuthorizeUser', true)
        commit('setFormKey', response.data.result.Output)   

        localStorage.setItem('formKey', response.data.result.Output)
        localStorage.setItem('userData', JSON.stringify({
          username: username
        }))
        return {
          code: 200,
          msg: 'Login Success'
        }
      } else {
        return {
          code: 401,
          msg: 'Login Failed'
        }
      }
    })
  },
  logoutUser ({ commit }) {
    localStorage.removeItem('formKey')
    localStorage.removeItem('userData')

    commit('setUsername', '')
    commit('setAuthorizeUser', false)
    commit('setFormKey', '')
    router.push('/auth/login')
  },
  resetPassword ({ commit }, email) {
    return Api.post({
      path: '/reset', 
      data: {
        email: email
      }
    }).then(response => {
      if (response.data && response.data.code === 200) {
        return {
          code: 200,
          msg: 'Reset Success'
        }
      } else {
        return {
          code: 401,
          msg: 'Reset Failed'
        }
      }
    })
  },
  checkToken ({ dispatch }) {
    Api.get('/user/all', true).then(response => {
      if (response.data && response.data.code === 200) {
        console.log('Formkey is active')
      } else {
        console.log('Formkey not active')
        dispatch('logoutUser')
      }
    })
  }
}
