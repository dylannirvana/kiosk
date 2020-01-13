<script>
import { mapActions } from 'vuex'
import CircaProductList from '@/components/CircaProductList'
import ZingTouch from 'zingtouch'

export default {
  name: 'Search',

  components: {
    CircaProductList
  },

  data () {
    return {
      selectedSubCategory: {},
      activeProduct: {},
      fromClass: ''
    }
  },

  mounted () {
    const touchArea = this.$refs.productListTouch

    let myRegion = new ZingTouch.Region(touchArea, false, false)
    myRegion.bind(touchArea, 'swipe', (e) => {
      const direction = e.detail.data[0].currentDirection

      if (direction > 90 && direction < 270) {
        this.nextPage()
      }
      if (direction < 90 || direction > 270) {
        this.prevPage()
      }
    })
  },

  methods: {
    ...mapActions({
      setProductListQuery: 'productList/setQuery',
      nextPage: 'productList/nextPage',
      prevPage: 'productList/prevPage'
    }),
    setFromClass (to, from) {
      let animatedClass = ''
      if (!from) return
      if (from.name === 'Product') { animatedClass = 'fromSingleProductView' }
      if (to.name === 'Product') { animatedClass = 'toSingleProductView' }
      this.fromClass = animatedClass
    }
  },

  computed: {
    singleProductView () {
      if (this.$route.params.baseCode) return true
      return false
    }
  },

  watch: {
    $route: {
      handler (to, from) {
        this.setProductListQuery({
          category: '',
          subCategory: '',
          search: this.$route.params.query
        })
        this.setFromClass(to, from)
      },
      immediate: true
    }
  }
}
</script>

<template>
  <div class="collection-wrapper" :class="[fromClass, {singleProductView: singleProductView}]">
    <div class="container-wrapper">
      <div class="bread-crumbs">
        <circa-bread-crumbs />
      </div>
      <div class="product-list-pagination" v-show="!singleProductView">
        <circa-pagination />
      </div>
    </div>
    <router-view v-model="activeProduct" :key="$route.path"></router-view>
    <div class="circa-product-list-touch-area" ref="productListTouch">
      <circa-product-list
        :activeProduct="activeProduct"
      />
    </div>
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  @import "../assets/sass/abstracts/index";
  .container-wrapper {
    padding: $container-padding;
  }

  .bread-crumbs {
    margin-top: 3%;
    margin-bottom: 2.5%;
    transition: all 600ms ease 400ms;
    width: 49.5%;
    display: inline-block;

    .singleProductView & {
      margin-top: 0;
    }

    .fromSingleProductView & {
      transition: all 600ms ease;
    }
  }
  .product-list-pagination {
    text-align: right;
    width: 49.5%;
    display: inline-block;
  }

  .fade-leave-active {
    transition: opacity 400ms ease, max-height 600ms ease 250ms;
    max-height: 120px;
  }
  .fade-enter-active {
    transition: opacity 400ms ease 400ms, max-height 600ms ease;
    max-height: 120px;
  }
  .fade-leave-to, .fade-enter /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
    max-height: 0;
  }
</style>
