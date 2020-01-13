import Axios from 'axios'
import store from '@/store'

const API_URL = process.env.ROOT_API

let headers = {
  headers: {
    'Content-Type': 'application/json'
  },
  json: true
}

export default {
  post ({path, contentType, data, auth = false}) {
    if (auth) {
      const user = store.state.auth.username
      const formKeyValue = store.state.auth.formKey
      path = `${path}?user=${user}&formkey=${formKeyValue}`
    }

    headers.method = 'POST'
    headers.url = API_URL + path
    headers.data = data
    if (contentType !== '' && contentType !== undefined) headers.headers['Content-Type'] = contentType

    return Axios(headers).then(response => {
      console.log('post', response)
      return response
    }).catch(error => {
      console.log('error', error)
      return error
    })
  },
  get (path, auth = false) {
    if (auth) {
      const user = store.state.auth.username
      const formKeyValue = store.state.auth.formKey
      path = `${path}?user=${user}&formkey=${formKeyValue}`
    }

    headers.method = 'GET'
    headers.url = API_URL + path
    return Axios(headers).then(response => {
      return response
    }).catch(error => {
      console.log('error', error)
      return error
    })
  }
}
