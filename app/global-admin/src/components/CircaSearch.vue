<template>
  <div class="search-wrapper" :class="{isActive: isActive}">
    <div class="search">
      <div class="input-wrapper">
        <div class="search-icon-wrapper" @click="handleSearchClick">
          <i class="fa fa-search"></i>
        </div>
        <input class="search-input" type="text" placeholder="Search by SKU/Product Name" @keypress="handleInputKeypress" v-model="searchTerm">
        <div class="close-icon-wrapper" @click="handleCloseClick">
          <i class="fas fa-times"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'circa-search',

  data () {
    return {
      state: 'default',
      stateOptions: [
        'default',
        'isOpening',
        'isOpen'
      ],
      isActive: false,
      searchTerm: '',
      searchResults: []
    }
  },

  computed: {
    ...mapState({
      products (state) {
        return state.products.products
      }
    })
  },

  methods: {
    handleSearchClick () {
      switch (this.state) {
        case 'default':
          this.state = 'isOpen'
          break
        case 'isOpen':
          this.submitSearch()
          break
      }
    },
    handleCloseClick () {
      this.state = 'default'
    },
    submitSearch () {
      const searchResults = this.products.filter(product => {
        const productTerms = (product.sku + product.baseCode + product.name).toLowerCase()
        if (productTerms.includes(this.searchTerm)) return true
        return false
      })
      this.state = 'default'
      this.searchResults = searchResults
    },
    handleInputKeypress (e) {
      if (e.keyCode === 13 && this.searchTerm !== '') {
        this.submitSearch()
      }
    }
  },

  watch: {
    state () {
      switch (this.state) {
        case 'default':
          this.isActive = false
          this.searchTerm = ''
          break
        case 'isOpen':
          this.isActive = true
          break
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  .search-wrapper {
    position: relative;
    display: block;
    height: 46px;
    width: 46px;
  }

  .search {
    width: 80px;
    transition: all 300ms;
    .isActive & {
      position: absolute;
      top: 0;
      right: 0;
      width: 300px;
    }
  }

  .search-icon-wrapper {
    position: relative;
    display: inline-block;
    padding: 5px 10px;
    z-index: 10;
    top: 6px;
    left: 6px;
    cursor: pointer;
  }

  .close-icon-wrapper {
    position: relative;
    padding: 5px 10px;
    z-index: 10;
    top: 6px;
    right: 6px;
    cursor: pointer;
    display: none;
    float: right;
    .isActive & {
      display: inline-block;
    }
  }

  .fa {
    color: #BEBEBE;
  }

  .search-input {
    border-radius: 5px;
    border-color: #BEBEBE;
    border-style: solid;
    display: inline-block;
    line-height: 40px;
    opacity: 0;
    padding: 0 20px 0 40px;
    position: absolute;
    right: 0;
    top: 0;
    width: 100%;
    transition: all 300ms;
    outline: none;

    .isActive & {
      opacity: 1;
    }
  }
</style>
