import { filterList } from '@/assets/static-data.json'
const getFilterType = (optionLabel) => {
  let filterTypesObj = {}
  filterList.map(filter => {
    filterTypesObj[filter.optionKey] = filter.type
  })
  return filterTypesObj[optionLabel]
}

export default {
  dynamicPath (path) {
    // To make local development easier to manage, this will check for browser hostname, and change to IP address when user is running app outsode docker container
    // HACK:
    return window.location.hostname === 'localhost' ? 'http://192.168.99.100' + path : path // renders app
    // return window.location.hostname === 'localhost' ? 'http://circascreens.com' + path : path // renders web global
  },
  compareFilter (optionValue, productOptionValue, type) {
    let cleanOptionValue = optionValue.slice(0, optionValue.length)
    cleanOptionValue = cleanOptionValue.includes('and above') ? cleanOptionValue.replace('and above', '- 9999999999') : cleanOptionValue
    const cleanData = value => value.trim().replace('"', '').replace('$', '').replace(',', '') * 1000000000
    let isMatch = false
    switch (type) {
      case 'range':
        let allValues = cleanOptionValue.split('-')
        allValues.push(productOptionValue)
        allValues = allValues.map(value => cleanData(value))
        const activeIndex = allValues.sort((a, b) => a - b).indexOf(cleanData(productOptionValue))
        isMatch = activeIndex === 1
        break
      case 'match':
        isMatch = cleanOptionValue === productOptionValue
        break
      case 'boolean':
        isMatch = productOptionValue === 'true'
        break
      default:
        isMatch = false
    }
    return isMatch
  },
  generateActiveFilterOptions (products) {
    let activeFilterOptions = {}
    products.map(product => {
      product.filterValues.map(filterValue => {
        const lable = filterValue.split(':')[0]
        const value = filterValue.split(':')[1]
        if (!activeFilterOptions[lable]) { activeFilterOptions[lable] = [] }
        if (activeFilterOptions[lable].includes(value)) return
        activeFilterOptions[lable].push(value)
      })
    })
    return activeFilterOptions
  },
  hideUnavailableFilters (dynamicFilterList, activeFilterOptions, exemptFilterLabels = []) {
    return dynamicFilterList.map(filter => {
      let filterObj = {...filter}
      if (filterObj.options && activeFilterOptions && activeFilterOptions[filterObj.optionKey] && !exemptFilterLabels.includes(filterObj.optionKey)) {
        filterObj.options = filterObj.options.map(optionValue => {
          optionValue = optionValue.label ? optionValue.label : optionValue

          let isActive = false
          for (let activeOptionValue of activeFilterOptions[filter.optionKey]) {
            isActive = this.compareFilter(optionValue, activeOptionValue, filterObj.type)
            if (isActive) {
              return {
                label: optionValue,
                isActive: true
              }
            }
          }

          return {
            label: optionValue,
            isActive: false
          }
        })
      }
      return filterObj
    })
  },
  naturalCompare (a, b) {
    let ax = []
    let bx = []
    a.replace(/(\d+)|(\D+)/g, (_, $1, $2) => { ax.push([$1 || Infinity, $2 || '']) })
    b.replace(/(\d+)|(\D+)/g, (_, $1, $2) => { bx.push([$1 || Infinity, $2 || '']) })
    while (ax.length && bx.length) {
      const an = ax.shift()
      const bn = bx.shift()
      const nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1])
      if (nn) return nn
    }
    return ax.length - bx.length
  },
  filterProducts ({activeFilters, products}) {
    return products.filter(product => {
      // Check if product matches all active filters
      const filterMatches = activeFilters.map(value => {
        const optionLabel = value.split(':')[0].toLowerCase()
        const optionValue = value.split(':')[1]

        let productOptions = product.filterValues.filter(filterValue => {
          return filterValue !== undefined && filterValue.split(':')[0] === optionLabel
        })

        if (productOptions.length < 1) {
          return {
            label: optionLabel,
            value: false
          }
        }

        productOptions = productOptions.map(item => {
          const filterLabel = item.split(':')[0]
          const filterValue = item.split(':')[1]
          const optionType = getFilterType(filterLabel)

          return this.compareFilter(optionValue, filterValue, optionType)
        })

        return {
          label: optionLabel,
          value: productOptions.includes(true)
        }
      })

      // Check if product matches each active filter label atleast once
      const filterLabels = [...new Set(activeFilters.map(filter => filter.split(':')[0].toLowerCase()))]
      const matches = filterLabels.map(label => {
        let labelMatches = filterMatches.filter(match => match.label === label).map(match => match.value)
        return labelMatches.includes(true)
      })

      return !matches.includes(false)
    })
  }
}
