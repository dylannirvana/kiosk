<script>
import { mapState, mapActions } from 'vuex'
import CircaProductList from '@/components/CircaProductList'
import CircaSubCategorySlider from '@/components/CircaSubCategorySlider'
import ZingTouch from 'zingtouch'

export default {
  name: 'Collection',

  components: {
    CircaSubCategorySlider,
    CircaProductList
  },

  data () {
    return {
      selectedSubCategory: {},
      activeProduct: {},
      fromClass: '',
      touchAreaIsSet: false
    }
  },

  methods: {
    ...mapActions({
      setProductListQuery: 'productList/setQuery',
      setSelectedProduct: 'productListSingle/setSelectedProduct',
      nextPage: 'productList/nextPage',
      prevPage: 'productList/prevPage',
      nextProduct: 'productListSingle/nextProduct',
      prevProduct: 'productListSingle/prevProduct'
    }),
    setFromClass (to, from) {
      let animatedClass = ''
      if (!from) return
      if (from.name === 'Product') { animatedClass = 'fromSingleProductView' }
      if (to.name === 'Product') { animatedClass = 'toSingleProductView' }
      this.fromClass = animatedClass
    },
    setQuery () {
      this.setProductListQuery({
        category: this.$route.params.collectionHandle,
        subCategory: this.$route.params.subCollectionHandle === 'view-all' ? '' : this.$route.params.subCollectionHandle,
        search: ''
      })
    },
    setTouchArea () {
      const touchArea = this.$refs.productListTouch

      if (touchArea) {
        let myRegion = new ZingTouch.Region(touchArea, false, false)
        myRegion.bind(touchArea, 'swipe', (e) => {
          let direction = e.detail.data[0].currentDirection
          direction = direction > 90 && direction < 270 ? 'next' : 'prev'

          if (!this.singleProductView) {
            this[direction + 'Page']() // this.nextPage() or this.prevPage()
          } else {
            this[direction + 'Product']({
              router: this.$router,
              path: this.$route.path
            })
          }
        })
        this.touchAreaIsSet = true
        return
      }

      setTimeout(() => {
        this.setTouchArea()
      }, 100)
    }
  },

  computed: {
    ...mapState({
      category (state) {
        return state.categories.formatted[this.$route.params.collectionHandle]
      },
      dataHasLoaded (state) {
        return state.products.loaded && state.categories.loaded
      }
    }),
    singleProductView () {
      if (this.$route.params.baseCode) return true
      return false
    },
    selectedProduct () {
      return this.$store.getters['productList/getProducts']({'base_code': this.$route.params.baseCode})[0]
    }
  },

  watch: {
    $route: {
      handler (to, from) {
        this.setFromClass(to, from)

        // If navigating within same category/sub-category dont reset data
        if (to && from && from.params.collectionHandle === to.params.collectionHandle && from.params.subCollectionHandle === to.params.subCollectionHandle) {
          return
        }

        if (this.dataHasLoaded) {
          this.setQuery()
        }
      },
      immediate: true
    },
    selectedSubCategory: {
      handler () {
        const selectedSubCategoryIsEmpty = !this.selectedSubCategory || Object.keys(this.selectedSubCategory).length === 0
        let {collectionHandle, subCollectionHandle} = this.$route.params
        if (selectedSubCategoryIsEmpty) {
          this.selectedSubCategory = this.category.subCategories.filter(category => category.label === subCollectionHandle)[0]
          return
        }
        subCollectionHandle = this.selectedSubCategory.label.replace(' ', '-')
        this.$router.push({ path: `/collection/${collectionHandle}/${subCollectionHandle.toLowerCase()}` })
      },
      immediate: true
    },
    dataHasLoaded: {
      handler () {
        if (this.dataHasLoaded) {
          this.setQuery()
        }
        if (this.dataHasLoaded && !this.touchAreaIsSet) {
          this.setTouchArea()
        }
      },
      immediate: true
    }
  }
}
</script>

<template>
  <div>
    <div class="collection-wrapper" v-show="dataHasLoaded" :class="[fromClass, {singleProductView: singleProductView}]">
      <transition name="fade">
        <div class="sub-category-slider-tabs" v-show="!singleProductView && category">
          <circa-sub-category-slider :category="category.handle" :subCategories="category.subCategories" v-model="selectedSubCategory" :key="category.handle"/>
        </div>
      </transition>
      <div class="container-wrapper">
        <div class="bread-crumbs">
          <circa-bread-crumbs />
        </div>
        <div class="product-list-pagination" v-show="!singleProductView">
          <circa-pagination />
        </div>
      </div>
      <router-view :key="$route.path"></router-view>
      <div class="circa-product-list-touch-area" ref="productListTouch">
        <circa-product-list />
      </div>
    </div>
    <div v-show="!dataHasLoaded" class="loading-screen">
      <img src="../assets/circa-logo.png">
    </div>
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  @import "../assets/sass/abstracts/index";
  .container-wrapper {
    padding: $container-padding;
  }

  .sub-category-slider-tabs {
    min-height: 109px;
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
