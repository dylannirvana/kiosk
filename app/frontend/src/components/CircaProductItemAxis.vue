<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'circa-product-item-axis',

  props: {
    product: {
      type: Object
    },
    allThumbsLoaded: {
      type: Boolean
    },
    thumbImagesLoaded: {
      type: Array
    },
    activeVariation: {
      type: Object
    }
  },

  data () {
    return {
      topWhiteSpace: '',
      potentialSizeKeys: ['height', 'diameter', 'o/a height', 'fixture height']
    }
  },

  computed: {
    ...mapState({
      singleViewIsActive (state) {
        return state.productList.singleViewIsActive
      },
      screenSize (state) {
        return state.productListSingle.screenSize
      },
      screenHeightInches (state) {
        return state.productListSingle.screenHeight
      },
      screenWidthInches (state) {
        return state.productListSingle.screenWidth
      },
      imageSizeState (state) {
        return state.productList.imageSizeState
      },
      viewState (state) {
        return state.productList.viewState
      }
    }),
    imageSrc () {
      return this.activeVariation ? (this.sizeAxis === 'fhp' ? this.activeVariation.main_img : this.activeVariation.cropped_img) : ''
    },
    sizeAxis () {
      const fixureHeightPercentage = this.product.variations ? this.fhp : ''
      const sizeAxis = this.product.variations && !fixureHeightPercentage ? this.product.variations[0].size_axis : 'fhp'
      if (sizeAxis === 'fhp' || sizeAxis === '') return 'fhp'
      const productLength = this.product.variations ? this.product.variations[0][this.axisKey] : ''
      return !productLength ? 'fhp' : sizeAxis
    },
    // fullSizeButtonVisible: {
    //   get () {
    //     let lengthLargerThanScreen = this.productLength.pixels > 1150
    //     if (this.sizeAxis === 'vertical') {
    //       const productHeight = this.productLength.pixels / this.imageRatio
    //       lengthLargerThanScreen = productHeight > 1480
    //     }
    //     return this.singleViewIsActive && lengthLargerThanScreen
    //   },
    //   set (newValue) {
    //     this.setFullSizeButtonVisible(newValue)
    //   }
    // },
    productStyles () {
      const productLength = this.productLength.pixels === 0 ? 'auto' : this.productLength.pixels + 'px'
      let styles = {
        wrapper: {},
        img: {}
      }
      if (!this.product) return styles

      if (this.viewState === 'singleView') styles.wrapper.width = productLength
      if (this.product.category_main === 'Fans') styles.img.marginTop = '-' + ((this.topWhiteSpace / 1400 * 100) - 4) + '%'

      if (this.imageSizeState === 'fitScreen' && this.dimensions.width > 1150) styles.wrapper.width = '90%'
      if (this.imageSizeState === 'fitScreen' && this.dimensions.height > 1480) styles.wrapper.width = (1480 * this.imageRatio) + 'px'
      if (this.imageSizeState === 'fitScreen' && this.dimensions.width > 1150 && this.dimensions.height > 1480) {
        const heightDimension = (this.dimensions.height - 1480) / 1480
        const widthDimension = (this.dimensions.width - 1150) / 1150
        styles.wrapper.width = heightDimension > widthDimension ? (1480 * this.imageRatio) + 'px' : '90%'
      }

      if (this.product.base_code === this.$route.params.baseCode) {
        this.setFullSizeButtonVisible((this.dimensions.width > 1150 || this.dimensions.height > 1480))
      }

      return styles
    },
    dimensions () {
      return {
        height: this.productLength.pixels / this.imageRatio,
        width: this.productLength.pixels
      }
    },
    productLength () {
      const variations = this.product.variations
      if (this.sizeAxis === 'fhp') {
        return this.productHeight
      }

      let length = {
        inches: 0,
        pixels: 0
      }

      const productLength = variations ? variations[0][this.axisKey] : false
      if (!this.product || !this.singleViewIsActive) return length

      length.inches = productLength.replace('"', '')
      length.inches = length.inches.split('-').length > 1 ? length.inches.split('-')[0] : length.inches
      length.inches = (length.inches * 1) + 1.25 // add an inch to length
      length.pixels = this.sizeAxis === 'horizontal' ? Math.floor((1080 / this.screenWidthInches) * length.inches) : Math.floor((1920 / this.screenHeightInches) * length.inches) * this.imageRatio

      return length
    },
    productHeight () {
      let height = {
        inches: 0,
        pixels: 0
      }
      if (!this.product) return height

      const activeSizeKeyIndex = this.potentialSizeKeys.map(key => this.criteria.keys.includes(key)).indexOf(true)
      if (!this.criteria.keys.length) return height
      if (!this.criteria.keys.length && activeSizeKeyIndex === -1 && !this.singleViewIsActive) return height

      height.inches = this.getHeightAverage(this.criteria.obj[this.potentialSizeKeys[activeSizeKeyIndex]].replace('"', ''))
      if (this.fhp) height.inches = height.inches / this.fhp
      height.inches = (height.inches * 1) + 1.25 // add an inch to all heights
      height.pixels = Math.floor((1920 / this.screenHeightInches) * height.inches)

      return height
    },
    fhp () {
      return this.product.variations ? this.product.variations[0].fhp : 0
    },
    criteria () {
      const criterias = this.product.variations ? this.product.variations[0].z_criteria : false
      return {
        keys: Object.entries(criterias).map(criteria => criteria[0]),
        obj: criterias
      }
    },
    axisKey () {
      return this.product.variations[0].size_axis === 'horizontal' ? 'size_axis_width' : 'size_axis_height'
    },
    imageRatio () {
      return this.product.variations ? this.product.variations[0].cropped_img_ratio : false
    }
  },

  methods: {
    ...mapActions({
      setFullSizeButtonVisible: 'productList/setFullSizeButtonVisible'
    }),
    getHeightAverage (height) {
      const splitHeight = height.split('-')
      return splitHeight.length > 1 ? (parseInt(splitHeight[0]) + parseInt(splitHeight[1])) / 2 : height
    },
    getWhiteSpaceData () {
      const imgSrc = this.product.variations[0].main_img
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      img.crossOrigin = 'anonymous'

      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        let pixelDataY
        for (var y = 0; y < img.height; y++) {
          if (y % 5 === 0) {
            for (var x = 0; x < img.width; x++) {
              if (x % 5 === 0) {
                pixelDataY = ctx.getImageData(x, y, 1, 1)
                if (pixelDataY.data[3] !== 0) {
                  this.topWhiteSpace = y
                  return y
                }
              }
            }
          }
        }
      }
      img.src = imgSrc
    }
  },

  watch: {
    $route () {
      if (this.product.base_code === this.$route.params.baseCode) {
        const {dimensions, fhp, sizeAxis} = this
        console.log({dimensions, fhp, sizeAxis, inches: this.productLength.inches})
      }
    },
    viewState: {
      handler () {
        if (this.viewState === 'isAnimatingToSingleView' || this.viewState === 'singleView') {
          this.$nextTick(() => {
            this.getWhiteSpaceData()
          })
          return
        }
        this.setFullSizeButtonVisible(false)
      },
      immediate: true
    }
  }
}
</script>

<template>
  <div>
    <router-link class="product-item" :to="$route.path + '/' + product.base_code" v-show="!singleViewIsActive">
      <circa-image
        :src="product.variations[0].main_img"
        :thumb="product.variations[0].thumb_img"
        :alt="'Image for ' + product.name"
        :groupedImage="true"
        :allThumbsLoaded="allThumbsLoaded"
        :isProductImg="true"
        :key="product.base_code"
        @imageLoaded="value => thumbImagesLoaded.push(value)"
      />
      <h5 class="product-title">{{product.name}}</h5>
      <h6 class="product-sku">{{product.base_code}}</h6>
    </router-link>
    <div class="product-item single-view" :class="{isAnimating: viewState === 'isAnimatingToSingleView'}" :style="productStyles.wrapper" v-show="singleViewIsActive" ref="imageWrapper">
      <circa-image
        :style="productStyles.img"
        :src="imageSrc"
        :thumb="activeVariation ? activeVariation.thumb_img : ''"
        :alt="'Image for ' + product.name"
        :isProductImg="true"
        :ratio="this.sizeAxis === 'fhp' ? 1 : activeVariation.cropped_img_ratio"
        :key="imageSrc"
        @imageLoaded="value => singleImageLoaded = value"
      />
      <h5 class="product-title">{{product.name}}</h5>
      <h6 class="product-sku">{{product.base_code}}</h6>
    </div>
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  @import "../assets/sass/abstracts/index";

  .product-item {
    display: inline-block;
    width: 100%;
    padding: 0 10px 30%;
    text-decoration: none;
    color: inherit;

    &.isAnimating {
      max-width: 100%;
    }
  }

  .product-title {
    font-size: 14px;
    text-align: center;
    margin: 5px 0;

    .singleViewIsActive & {
      display: none;
    }
  }

  .product-sku {
    font-size: 10px;
    font-weight: 500;
    text-align: center;
    color: #717073;

    .singleViewIsActive & {
      display: none;
    }
  }
</style>
