<script>
import { mapState, mapActions } from 'vuex'
import CircaProductDetailsPopout from '@/components/CircaProductDetailsPopout'

export default {
  name: 'product-details',

  components: {
    CircaProductDetailsPopout
  },

  computed: {
    ...mapState({
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
    currentProductPage () {
      return Math.ceil((this.currentProductIndex + 1) / 20)
    }
  },

  mounted () {
    this.setCurrentPage(this.currentProductPage)
  },

  methods: {
    ...mapActions({
      setSelectedProduct: 'productListSingle/setSelectedProduct',
      setCurrentPage: 'productList/setCurrentPage'
    })
  },

  watch: {
    $route: {
      handler () {
        this.setSelectedProduct(this.$route.params.baseCode)
      },
      immediate: true
    },
    product: {
      handler () {
        if (!this.product.base_code) this.setSelectedProduct(this.$route.params.baseCode)
      },
      immediate: true
    }
  }
}
</script>

<template>
  <div class="product-details-wrapper">
    <circa-product-details-popout />
    <div class="product-details" v-if="activeVarient">
      <h1 class="product-name">{{ product.name }}</h1>
      <h4>
        <span class="designer-name">
          {{ activeVarient.designer }}
        </span>
        <span class="basecode-text">
          Item {{activeVarient.sku}}
        </span>
      </h4>
      <ul class="details-wrapper">
        <li v-for="(item, index) in Object.entries(activeVarient.z_options)" :key="index">
          <b>{{item[0] | capitalize}}:</b> {{item[1]}}
        </li>
      </ul>
    </div>
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  @import "../assets/sass/abstracts/index";
  .product-details {
    padding: $container-padding;
    animation-duration: 800ms;
    animation-name: fadein;
  }

  h1,
  h4 {
    margin-bottom: 20px;
  }

  .product-name {
    font-size: 30px;
  }

  .designer-name,
  .basecode-text {
    font-size: 14px;
    letter-spacing: 2px;
    line-height: 14px;
    text-transform: uppercase;
  }

  .designer-name {
    font-family: "Bookman Old Style";
    margin-right: 80px;
  }

  .basecode-text {
    font-weight: 500;
  }

  .details-wrapper {
    padding: 0;
    list-style: none;
    font-size: 14px;
    line-height: 18px;
  }

  @keyframes fadein {
    from {
      opacity: 0;
      transform: translateY(60px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
