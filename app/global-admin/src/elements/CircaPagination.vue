<template>
  <div class="pagination-wrapper">
    <div class="pagination">
      <div class="arrow-btn left-arrow" :class="{deactive: currentPage === 1}" @click="prevPage">
        <i class="fas fa-chevron-left"></i>
      </div>
      <div class="pagination-info-wrapper">
        {{currentFrom}}-{{currentTo}} <em>of</em> {{totalCount}}
      </div>
      <div class="arrow-btn right-arrow" :class="{deactive: currentPage === totalPages}" @click="nextPage">
        <i class="fas fa-chevron-right"></i>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'circa-pagination',

  data () {
    return {
      currentPage: 1
    }
  },

  props: {
    countPerPage: {
      type: String,
      default: '20'
    },
    totalCount: {
      type: Number
    },
    page: {
      type: String,
      default: '1'
    }
  },

  computed: {
    currentFrom () {
      return ((this.currentPage - 1) * this.countPerPage) + 1
    },
    currentTo () {
      if (this.totalPages === this.currentPage) return this.totalCount
      return this.currentPage * this.countPerPage
    },
    totalPages () {
      return Math.ceil(this.totalCount / this.countPerPage)
    }
  },

  methods: {
    nextPage () {
      const nextPage = this.currentPage + 1
      this.currentPage = nextPage > this.totalPages ? this.currentPage : nextPage
    },
    prevPage () {
      const prevPage = this.currentPage - 1
      this.currentPage = prevPage < 1 ? this.currentPage : prevPage
    }
  },

  watch: {
    currentPage () {
      this.$emit('input', this.currentPage)
    }
  }
}
</script>

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
