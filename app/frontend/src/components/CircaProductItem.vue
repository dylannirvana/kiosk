<script>

export default {
  name: 'circa-product-item',

  props: {
    product: {
      type: Object
    },
    singleViewIsActive: {
      type: Boolean
    },
    allThumbsLoaded: {
      type: Boolean
    },
    thumbImagesLoaded: {
      type: Array
    },
    selectedProductStyles: {
      type: Object
    },
    activeVariation: {
      type: Object
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
    <div class="product-item single-view" :style="selectedProductStyles.wrapper" v-show="singleViewIsActive" ref="imageWrapper">
      <circa-image
        :style="selectedProductStyles.img"
        :src="activeVariation ? activeVariation.main_img : ''"
        :thumb="activeVariation ? activeVariation.thumb_img : ''"
        :alt="'Image for ' + product.name"
        :isProductImg="true"
        :key="activeVariation ? activeVariation.main_img : ''"
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
