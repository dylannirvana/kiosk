<script>
import { mapState, mapActions } from 'vuex'
import Flickity from 'vue-flickity'
import Helpers from '@/services/helpers-service'

export default {
  name: 'circa-product-details-popout',

  components: {
    Flickity
  },

  data () {
    return {
      selectedVariation: '',
      detailIsOpen: true,
      imagesLoaded: [],
      flickityOptions: {
        freeScroll: true,
        contain: true,
        prevNextButtons: false,
        pageDots: true,
        cellAlign: 'left'
      },
      activeIframeModal: ''
    }
  },

  computed: {
    ...mapState({
      products (state) {
        return [].concat.apply([], state.productList.paged.products)
      },
      product (state) {
        return state.productListSingle.selectedProduct
      },
      activeVarient (state) {
        return state.productListSingle.activeVarient
      },
      currentProductIndex (state) {
        return state.productListSingle.selectedProductIndex
      }
    }),
    variationImagesLoaded () {
      if (this.imagesLoaded.length === this.product.variations.length) {
        this.$nextTick(() => {
          this.$refs.variationFlickity.rerender()
        })
      }
      return this.imagesLoaded.length === this.product.variations.length
    },
    pagedVariations () {
      const countPerPage = 6
      let pages = []
      const totalPages = Math.ceil(this.product.variations.length / countPerPage)
      for (let pageNumber = 0; pageNumber < totalPages; pageNumber++) {
        const page = this.product.variations.slice(pageNumber * countPerPage, (pageNumber + 1) * countPerPage)
        pages.push(page)
      }
      return pages
    },
    pagedVaritationDotsSpacing () {
      return (Math.ceil(this.pagedVariations.length / 11) * 15) + 'px'
    },
    prevProduct () {
      return this.products[this.currentProductIndex - 1]
    },
    nextProduct () {
      return this.products[this.currentProductIndex + 1]
    }
  },

  methods: {
    ...mapActions({
      setActiveVarient: 'productListSingle/setActiveVarient'
    }),
    dynamicPath: Helpers.dynamicPath
  },

  watch: {
    selectedVariation () {
      this.setActiveVarient(this.product.variations.filter(variation => variation.sku === this.selectedVariation)[0])
    }
  }
}
</script>

<template>
  <div class="product-details-popout-wrapper" :class="{isOpen: detailIsOpen}">
    <div class="product-details-popout">
      <div class="toggle-popout" @click="detailIsOpen = !detailIsOpen">
        <i class="fas fa-times"></i>
      </div>
      <div class="options-wrapper">
        <h3 class="popout-title">Select an Option</h3>

        <div class="variations-wrapper-placeholder" v-if="!variationImagesLoaded">
          <div class="placeholder-item" v-for="(placeholder, index) in pagedVariations[0]" :key="index"></div>
        </div>

        <div class="variations-wrapper" :class="{onePage: pagedVariations.length === 1}" v-show="variationImagesLoaded">
          <flickity ref="variationFlickity" :options="flickityOptions" :style="{paddingBottom: pagedVaritationDotsSpacing}">
            <div class="variations-page" v-for="(page, pageIndex) in pagedVariations" :key="pageIndex">
              <div v-for="(variation, index) in page" class="variation-item" :class="{isSelected: selectedVariation === variation.sku}" :key="index">
                <label>
                  <input type="radio" :value="variation.sku" v-model="selectedVariation">
                  <img :src="dynamicPath(variation.main_img)" alt="" @load="imagesLoaded.push(true)">
                </label>
              </div>
            </div>
          </flickity>
        </div>
      </div>
      <div v-if="activeVarient" class="specifications-wrapper">
        <div class="specifications">
          <h4>Specifications</h4>
          <div class="spec-item" v-if="activeVarient.chain_length">
            <p>{{activeVarient.chain_length}}</p>
          </div>
          <div class="spec-item" v-for="(item, index) in Object.entries(activeVarient.z_criteria)" :key="index">
            <p>{{item[0]}}: {{item[1]}}</p>
          </div>
        </div>
        <circa-button faIcon="fa fa-file-pdf" class="full stacked" @click.native="activeIframeModal = activeVarient.data_sheet">Specification Sheet</circa-button>
        <circa-button faIcon="fa fa-file-pdf" class="full" @click.native="activeIframeModal = activeVarient.cad_block">Installation Guide</circa-button>
      </div>
      <div v-if="activeVarient" class="price-wrapper">
        <p class="price">
          {{activeVarient.price | price}}
        </p>
      </div>
    </div>
    <div class="product-pagination-wrapper">
      <div class="product-pagination">
        <router-link v-if="prevProduct" class="product-item" :to="$route.path.replace(product.base_code, prevProduct.base_code)">
          <img :src="dynamicPath(prevProduct.variations[0].main_img)" alt="" >
          <p>
            {{prevProduct.name}}
          </p>
          <button class="btn">
            Previous
          </button>
        </router-link>
        <router-link  v-if="nextProduct" class="product-item" :to="$route.path.replace(product.base_code, nextProduct.base_code)">
          <img :src="dynamicPath(nextProduct.variations[0].main_img)" alt="" >
          <p>
            {{nextProduct.name}}
          </p>
          <button class="btn">
            Next
          </button>
        </router-link>
      </div>
    </div>
    <div class="pdf-modal-wrapper" v-if="activeIframeModal">
      <div class="pdf-modal">
        <button class="close-pdf-modal" @click="activeIframeModal = ''">
          <svg width="14" height="14" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.36 11.855c.093.094.14.211.14.352 0 .14-.047.258-.14.352l-1.337 1.3a.437.437 0 0 1-.316.141.477.477 0 0 1-.352-.14L6.75 9.253l-4.605 4.605a.437.437 0 0 1-.317.141.477.477 0 0 1-.351-.14L.14 12.558A.477.477 0 0 1 0 12.207c0-.14.047-.258.14-.352L4.782 7.25.141 2.68c-.235-.235-.235-.47 0-.703L1.44.64C1.582.547 1.7.5 1.793.5c.14 0 .258.047.352.14L6.75 5.21 11.355.64c.141-.093.258-.14.352-.14.14 0 .258.047.352.14l1.3 1.337c.235.234.235.457 0 .668l-4.64 4.57 4.64 4.64z" fill="#191614" fill-rule="nonzero"/>
          </svg>
        </button>
        <div class="iframe-wrapper">
          <iframe :src="activeIframeModal" />
        </div>
      </div>
    </div>
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
  @import "../assets/sass/abstracts/index";
  .product-details-popout-wrapper {
    position: absolute;
    width: 40px;
    padding-left: 40px;
    right: 0;
    margin-top: -40px;
    z-index: 999;
    overflow: hidden;
    transition: all 400ms;

    &.isOpen {
      width: 360px;
    }
  }

  .product-details-popout {
    position: relative;
    border: solid #e1e1e1 1px;
    border-bottom-left-radius: 5px;
    border-right-width: 0;
    min-width: 320px;
    transition: all 400ms;

    .popout-title {
      font-family: 'Bookman Old Style';
      font-size: 14px;
      letter-spacing: 1.75px;
      text-transform: uppercase;
      margin-bottom: 20px;
    }

    p {
      margin: 0;
    }

    .options-wrapper,
    .specifications-wrapper,
    .price-wrapper {
      padding: 30px;
      backdrop-filter: blur(4px);
      background: rgba(255, 255, 255, 0.85);
      &:not(:last-child) {
        border-bottom: solid #e1e1e1 1px;
      }
    }

    .toggle-popout {
      position: absolute;
      top: -1px;
      left: -40px;
      z-index: 99;

      height: 40px;
      width: 40px;

      background: rgba(255, 255, 255, 0.85);
      border: solid #e1e1e1 1px;
      border-bottom-left-radius: 5px;
      border-top-left-radius: 5px;
      border-right-color: $color-white;

      text-align: center;
      line-height: 40px;
      cursor: pointer;

      i {
        transform: rotate(45deg);
        transition: all 400ms;

        .isOpen & {
          transform: rotate(0);
        }
      }
    }

    .variations-wrapper-placeholder {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-column-gap: 20px;
      grid-row-gap: 20px;
      width: 100%;

      .placeholder-item {
        border-radius: 5px;
        border: solid #e1e1e1 1px;
        background: #f7f7f7;
        padding-bottom: 110%;
      }
    }

    .variations-wrapper {
      margin-bottom: 20px;

      &.onePage {
        .flickity-page-dots {
          opacity: 0;
        }
      }

      .variations-page {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-column-gap: 20px;
        grid-row-gap: 20px;
        width: 100%;
        margin-right: 20px;
      }

      .variation-item {
        border-radius: 5px;
        border: solid #e1e1e1 1px;

        &.isSelected {
          border-color: #666;
        }

        label {
          display: block;
          padding: 10px 0;
          cursor: pointer;
        }

        input {
          opacity: 0;
          position: absolute;
        }
        img {
          width: 100%;
        }
      }

    }

    .specifications {
      margin-bottom: 20px;
      font-size: 14px;

      h4 {
        font-weight: 800;
        letter-spacing: 1.5px;
        text-transform: uppercase;
      }
      .spec-item {
        p {
          text-transform: capitalize;
          line-height: 24px;
        }
      }
    }

    .price {
      text-align: center;
      font-size: 21px;
      letter-spacing: 2px;
    }

    .flickity-page-dots {
      .dot {
        width: 6px;
        height: 6px;
      }
    }
  }

  .pdf-modal-wrapper {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;

    &:after {
      content: "";
      background: rgba(0, 0, 0, 0.2);
      position: fixed;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: 100;
    }

    .pdf-modal {
      position: relative;
      width: 90vw;
      height: calc(.78 * 90vw);
      z-index: 101;

      .close-pdf-modal {
        position: absolute;
        padding: 15px;
        background: $color-white;
        border-width: 0;
        border-radius: 25px;
        margin-left: -20px;
        margin-top: -20px;
      }

      .iframe-wrapper {
        border: solid 4px rgb(122, 126, 129);
        border-radius: 5px;
        box-shadow: 4px 8px 16px rgba(0,0,0,0.2);
        background: $color-white;
        overflow: hidden;
        width: 100%;
        height: 100%;
      }

      iframe {
        width: calc(100% + 40px);
        height: calc(100% + 4px);
        margin-left: -7px;
        margin-top: -2px;
      }
    }
  }

  .product-pagination-wrapper {
    padding: 0 5px;
    transform: translateX(320px);
    transition: all 400ms;

    .isOpen & {
      transform: translateX(0);
    }
  }

  .product-pagination {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-column-gap: 20px;
    grid-row-gap: 20px;

    .product-item {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 5px;
      border: solid #e1e1e1 1px;
      margin-top: 20px;
      padding-bottom: 30px;
      position: relative;
      text-decoration: none;
      text-align: center;

      img {
        max-width: calc(100% - 40px);
        margin: 20px 20px 0;
      }

      p {
        font-size: 12px;
        padding: 0 5px;
      }

      .btn {
        width: 100%;
        line-height: 30px;
        border-top: 1px solid #e1e1e1;
        border-right-width: 0;
        border-bottom-width: 0;
        border-left-width: 0;
        position: absolute;
        left: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0);
      }
    }
  }

</style>
