import sample from '@/assets/sample.json'
import { categoryList } from '@/assets/static-data.json'
// import camelCase from 'lodash/camelCase'

export default {
  getProducts () {
    let groups = {
      currentCount: 0,
      indexMapping: [],
      products: [],
      byCategory: {}
    }
    for (let product of sample.result.Output) {
      product = product['data-feed']
      product.detail.sku = product.sku
      const baseCode = product.base_code
      let productObj = {
        sku: product.sku,
        baseCode: baseCode,
        category: product.category,
        designer: product.detail.designer,
        image: product.detail.main_img,
        function: product.function,
        name: product.name.split(' in ')[0],
        sortOrder: product.sort_order,
        variations: []
      }
      if (groups.indexMapping[baseCode] === undefined) {
        groups.indexMapping[baseCode] = groups.currentCount
        groups.products[groups.currentCount] = productObj
        groups.currentCount++
      }
      groups.products[groups.indexMapping[baseCode]].variations.push(product.detail)
    }

    let productsByCategory = {}
    groups.products.map((product, index) => {
      const productCategory = product.category.split('>')[0].trim().toLowerCase()
      // product.filterValues = this.getProductFilterValues(product)
      if (!productsByCategory[productCategory]) {
        productsByCategory[productCategory] = [product]
      } else {
        productsByCategory[productCategory].push(product)
      }
    })

    return {
      all: groups.products,
      byCategory: productsByCategory
    }
  },
  getProductFilterValues (product) {
    const variations = [...product.variations]
    let productFilterValues = []
    let filterOptions = {}
    variations.map(variation => {
      let filterValues = []
      for (let key in variation.criteria) {
        const criteriaOptionDoesntExist = filterOptions[key] === undefined || filterOptions[key] === 0
        const criteriaLabel = key.charAt(0).toUpperCase() + key.slice(1)
        const criteriaValue = variation.criteria[key].trim()
        filterValues = [...filterValues, `${criteriaLabel}:${criteriaValue}`]
        if (criteriaOptionDoesntExist) {
          filterOptions[key] = {
            label: criteriaLabel,
            options: [criteriaValue]
          }
        }
        if (!criteriaOptionDoesntExist && !filterOptions[key].options.includes(criteriaValue)) {
          filterOptions[key].options = [...filterOptions[key].options, criteriaValue].sort(this.naturalCompare)
        }
      }
      filterValues.map(value => {
        if (!productFilterValues.includes(value)) productFilterValues.push(value)
      })
    })
    return productFilterValues
  },
  getCategories () {
    return categoryList
  }
}
