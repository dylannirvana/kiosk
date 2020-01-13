'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  // HACK:
  ROOT_API: '"http://192.168.99.100/api"' // this runs the stack
  // ROOT_API: '"http://circascreens/api"' // this pulls from the web global
})
