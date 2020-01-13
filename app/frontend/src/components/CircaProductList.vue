<script>
import CircaProductListFilters from '@/components/CircaProductListFilters'
import CircaProductItemAxis from '@/components/CircaProductItemAxis'
import { mapState, mapActions } from 'vuex'
import { TimelineLite } from 'gsap'

export default {
  name: 'circa-product-list',

  components: {
    CircaProductListFilters,
    CircaProductItemAxis
  },

  data () {
    return {
      delayedCurrentPage: 1,
      paginationIsAnimating: true,
      animation: 'reset',
      thumbImagesLoaded: [],
      paginateAnimation: 'default'
    }
  },

  computed: {
    ...mapState({
      currentPage (state) {
        return state.productList.paged.currentPage
      },
      pagedProducts (state) {
        return state.productList.paged.products
      },
      activeVariation (state) {
        return state.productListSingle.activeVarient
      },
      singleViewIsActive (state) {
        return state.productList.singleViewIsActive
      },
      imageSizeState (state) {
        return state.productList.imageSizeState
      },
      viewState (state) {
        return state.productList.viewState
      },
      fullSizeButtonVisible (state) {
        return state.productList.fullSizeButtonVisible
      }
    }),
    allThumbsLoaded  () {
      if (this.pagedProducts[this.currentPage]) {
        return this.thumbImagesLoaded.filter(loaded => loaded === true).length >= this.pagedProducts[this.currentPage].length
      }
      return false
    },
    paginationTimeline () {
      return new TimelineLite()
    },
    baseCode () {
      return this.$route.params.baseCode
    },
    selectedIndex () {
      let selectedIndex = 0
      this.pagedProducts[this.currentPage - 1].map((product, index) => {
        if (product.base_code === this.baseCode) selectedIndex = index
      })
      return selectedIndex
    },
    selectedStyles () {
      const translateX = (100 - ((this.selectedIndex % 5) * 50)) + '%'
      return this.pagedProducts[this.currentPage - 1].map(product => {
        return this.viewState !== 'singleView' && product.base_code === this.baseCode ? {
          transform: `scale(2) translateX(${translateX})`
        } : {}
      })
    }
  },

  methods: {
    ...mapActions({
      setSingleViewIsActive: 'productList/setSingleViewIsActive',
      setImageSizeState: 'productList/setImageSizeState',
      setViewState: 'productList/setViewState'
    }),
    pageIsActive (page) {
      if (page === this.delayedCurrentPage || page === this.delayedCurrentPage + 1 || page === this.delayedCurrentPage - 1) return true
    },
    pageClass (page) {
      let pageClass = ''
      switch (page) {
        case this.delayedCurrentPage:
          pageClass = 'currentPage'
          break
        case this.delayedCurrentPage + 1:
          pageClass = 'nextPage'
          break
        case this.delayedCurrentPage - 1:
          pageClass = 'prevPage'
          break
      }
      return pageClass
    },
    toggleSize () {
      if (this.imageSizeState === 'lifeSize') {
        this.setImageSizeState('fitScreen')
        return
      }
      if (this.imageSizeState === 'fitScreen') this.setImageSizeState('lifeSize')
      this.$nextTick(() => this.centerProduct())
    },
    setComponentState (to, from) {
      if ((to && from) && to.name.includes('Product') && (from.name === 'Collection' || from.name === 'Search')) {
        this.setViewState('isAnimatingToSingleView')
        setTimeout(() => { this.setViewState('singleView') }, 1500)
        return
      }

      if (to.name.includes('Product')) {
        this.setViewState('singleView')
        return
      }

      this.setViewState('listView')
    },
    centerProduct () {
      const windowWidth = document.documentElement.clientWidth
      let productWidth = 0
      this.$refs[this.baseCode][0].querySelectorAll('img').forEach(img => {
        productWidth = img.clientWidth > productWidth ? img.clientWidth : productWidth
      })
      if (productWidth > windowWidth && this.singleViewIsActive) {
        this.$refs[this.baseCode].scrollLeft = (productWidth - windowWidth) / 2
        document.querySelector('.product-item-wrapper.selected').scrollLeft = (productWidth - windowWidth) / 2
      }
    }
  },

  watch: {
    $route: {
      handler (to, from) {
        this.setComponentState(to, from)
        this.setImageSizeState('fitScreen')
      },
      immediate: true
    },
    viewState: {
      handler () {
        this.setSingleViewIsActive(this.viewState === 'singleView' || this.viewState === 'isAnimatingToSingleView')
      },
      immediate: true
    },
    currentPage (prevPage, newPage) {
      this.thumbImagesLoaded = []

      const animateClass = newPage > prevPage ? 'animateRight' : 'animateLeft'
      this.paginateAnimation = animateClass

      setTimeout(() => {
        this.delayedCurrentPage = this.currentPage
        this.paginateAnimation = 'default'
      }, 800)
    }
  }
}
</script>

<template>
  <div class="product-list-wrapper" v-if="pagedProducts.length > 0" :class="{singleViewIsActive: singleViewIsActive, animationIsDone: viewState === 'singleView', isAnimating: viewState === 'isAnimatingToSingleView'}">
    <circa-product-list-filters v-if="!singleViewIsActive"/>
    <div class="buttons-wrapper" v-if="fullSizeButtonVisible">
      <circa-button
        v-if="imageSizeState !== 'fitScreen'"
        class="toggle-size-btn"
        faIcon="fas fa-compress"
        @click.native="toggleSize"
      >
        Exit Full Size
      </circa-button>
      <circa-button
        v-else
        class="toggle-size-btn"
        faIcon="fas fa-expand"
        @click.native="toggleSize"
      >
        Enter Full Size
      </circa-button>
    </div>

    <div class="product-list-pages-wrapper" :class="paginateAnimation">
      <div class="product-list-page" v-for="(products, index) in pagedProducts" v-if="pageIsActive(index + 1)" :class="pageClass(index + 1)" :key="index">
        <div class="product-item-wrapper"
          v-for="(product, index) in products"
          :class="{notSelected: baseCode !== product.base_code, selected: baseCode === product.base_code}"
          :style="selectedStyles[index]"
          :key="index"
          :ref="product.base_code"
        >
          <circa-product-item-axis
            :product="product"
            :allThumbsLoaded="allThumbsLoaded"
            :thumbImagesLoaded="thumbImagesLoaded"
            :activeVariation="activeVariation"
            :toggleSize="toggleSize"
          />
        </div>
      </div>
    </div>
  </div>
  <div v-else class="no-results-wrapper">
    <h3>Sorry no search results found!</h3>
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  @import "../assets/sass/abstracts/index";

  .product-list-page {
    width: 100vw;
    position: absolute;
    transition: all 750ms ease-out;
    -webkit-transform-style: preserve-3d;
    -webkit-backface-visibility: hidden;

    .default & {
      transition: all 0ms ease-out;
    }
  }

  .prevPage {
    left: -100vw;

    .animateRight & {
      left: 0vw;
    }
  }
  .currentPage {
    left: 0vw;

    .animateLeft & {
      left: -100vw;
    }

    .animateRight & {
      left: 100vw;
    }
  }
  .nextPage {
    left: 100vw;

    .animateLeft & {
      left: 0vw;
    }
  }

  .buttons-wrapper {
    padding: $container-padding;
  }

  .product-list-wrapper {
    padding: 0;
    animation-duration: 1s;
    animation-name: slidein;

    &.singleViewIsActive {
      padding: 0;
    }
  }

  .product-list-filters {
    @include aspect-ratio(998, 68);
    margin-bottom: 5%;
    border-radius: 5%;
    background: #f7f7f7;
  }

  .product-list-pages-wrapper {
    position: relative;
    height: calc(100vh - 384px);
    overflow: hidden;
    padding: 0 1%;

    @media (max-width: 1060px) {
      height: calc(100vw * 1.2);
    }

    .animationIsDone & {
      overflow: unset;
    }
  }

  .product-list-page {
    display: flex;
    flex-wrap: wrap;

    .animationIsDone & {
      overflow: hidden;
    }
  }

  .product-item-wrapper {
    $transitionTime: 1500ms;
    cursor: pointer;

    width: 20%;
    height: 100%;
    max-height: 360px;

    transition: max-height $transitionTime ease, transform 1500ms ease;
    transform-origin: 50% 0;

    .singleViewIsActive & {
      justify-content: center;
      max-height: 100%;
      overflow: scroll;
    }
  }

  .notSelected {
    .singleViewIsActive & {
      transform: scale(0);
      overflow: hidden;
      opacity: 0;
      max-height: 0px;
    }
    .animationIsDone & {
      display: none;
    }
  }

  .selected {
    .animationIsDone & {
      width: calc(100% + 10px);
      margin-right: -10px;
      margin-bottom: -10px;
      text-align: center;
      transition: transform 0ms ease;
    }
  }

  .no-results-wrapper {
    text-align: center;
  }

  @keyframes slidein {
    from {
      transform: translateY(100px);
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
