<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'circa-pagination',

  data () {
    return {
      isPaginating: false
    }
  },

  computed: {
    ...mapState({
      currentPage (state) {
        return state.productList.paged.currentPage
      },
      countPerPage (state) {
        return state.productList.paged.countPerPage
      },
      totalPages (state) {
        return state.productList.paged.totalPages
      },
      totalCount (state) {
        return this.totalPages > 0 ? state.productList.paged.products.map(products => products.length).reduce((a, b) => a + b) : 0
      }
    }),
    currentFrom () {
      return ((this.currentPage - 1) * this.countPerPage) + 1
    },
    currentTo () {
      if (this.totalPages === this.currentPage) return this.totalCount
      return this.currentPage * this.countPerPage
    }
  },

  methods: {
    ...mapActions({
      nextPage: 'productList/nextPage',
      prevPage: 'productList/prevPage'
    }),
    handleNextPage () {
      if (this.currentPage === this.totalPages || this.isPaginating) return
      this.nextPage()
    },
    handlePrevPage () {
      if (this.currentPage === 1 || this.isPaginating) return
      this.prevPage()
    }
  },

  watch: {
    currentPage () {
      this.isPaginating = true
      setTimeout(() => {
        this.isPaginating = false
      }, 800)
    }
  }
}
</script>

<template>
  <div class="pagination-wrapper" v-if="totalPages > 0">
    <div class="pagination">
      <div class="arrow-btn left-arrow" :class="{deactive: currentPage === 1}" @click="handlePrevPage">
        <i class="fas fa-chevron-left"></i>
      </div>
      <div class="pagination-info-wrapper">
        {{currentFrom}}-{{currentTo}} <em>of</em> {{totalCount}}
      </div>
      <div class="arrow-btn right-arrow" :class="{deactive: currentPage === totalPages}" @click="handleNextPage">
        <i class="fas fa-chevron-right"></i>
      </div>
    </div>
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  .arrow-btn,
  .pagination-info-wrapper {
    display: inline-block;
  }

  .pagination-info-wrapper {
    margin: 0 20px;

    em {
      margin-right: 4px;
    }
  }

  .arrow-btn {
    font-size: 12px;
    cursor: pointer;
    width: 30px;
    height: 30px;
    border: solid 1px #333;
    padding-top: 6px;
    border-radius: 30px;
    text-align: center;

    &.deactive {
      opacity: 0.2;
    }
  }

  .left-arrow {
    padding-right: 2px;
  }

  .right-arrow {
    padding-left: 2px;
  }
</style>
