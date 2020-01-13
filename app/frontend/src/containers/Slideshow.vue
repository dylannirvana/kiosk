<script>
import { mapState } from 'vuex'

export default {
  name: 'slideshows',

  props: {
    category: {
      type: Object,
      default () {
        return {
          label: false
        }
      }
    }
  },

  data () {
    return {
      fromImageIndex: 0,
      toImageIndex: 1,
      imageRotation: null,
      showAdminButton: false,
      showProductsButton: false
    }
  },

  mounted () {
    this.imageRotation = setInterval(() => {
      this.fromImageIndex = this.totalImages === this.fromImageIndex ? 0 : this.fromImageIndex + 1
      this.toImageIndex = this.totalImages === this.fromImageIndex ? 1 : this.toImageIndex + 1
    },
    Math.floor(Math.random() * 60) * 100 + 5000)
  },

  beforeDestroy () {
    clearInterval(this.imageRotation)
  },

  computed: {
    ...mapState({
      slideshow (state) {
        return state.slideshows.all.filter(slide => {
          return this.$route.params.id === slide.id
        })[0]
      }
    }),
    totalImages () {
      return this.slideshow.images.length
    }
  }
}
</script>

<template>
  <div class="slideshow-wrapper">

    <div class="circa-logo" @click="showAdminButton = !showAdminButton">
      <img src="../assets/circa-logo-white.png">
    </div>
    <transition name="fade-down">
      <div class="circa-admin-button" v-if="showAdminButton">
        <circa-button to="/admin" class="full transparent">Go to Admin</circa-button>
      </div>
    </transition>

    <div class="circa-products-button" @click="showProductsButton = !showProductsButton">
      <transition name="fade-down">
        <circa-button to="/collections" v-if="showProductsButton" class="transparent">Go to Products</circa-button>
      </transition>
    </div>

    <div class="image-wrapper">
      <transition name="fade" v-for="(image, index) in slideshow.images" :key="index">
        <div class="image-item"
          v-if="index === fromImageIndex"
          :style="{backgroundImage: `url(/static/media/${image.img})`}"
        >
        </div>
      </transition>
      <div class="image-item-bg"
        :style="{backgroundImage: `url(/static/media/${slideshow.images[0].img})`}"
      >
      </div>
    </div>
    <div class="slideshow-current-count">
      <p>{{toImageIndex}} / {{totalImages}}</p>
    </div>
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  @import "../assets/sass/abstracts/index";
  .fade-enter-active, .fade-leave-active {
    transition: opacity 1s;
  }
  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }

  .fade-down-enter-active, .fade-down-leave-active {
    transition: 300ms;
  }
  .fade-down-enter, .fade-down-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
    margin-top: -60px;
  }

  .circa-logo {
    position: fixed;
    top: 0;
    left: 0;
    opacity: 0.4;
    z-index: 12;
    max-width: 220px;
    padding: 40px;
    cursor: pointer;

    img {
      max-width: 100%;
    }
  }

  .circa-admin-button {
    position: fixed;
    top: 100px;
    left: 0;
    z-index: 12;
    padding: 0 40px;
  }

  .circa-products-button {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 50%;
    z-index: 12;
    padding: 100px 40px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    cursor: pointer;
  }

  .image-wrapper {
    .image-item,
    .image-item-bg {
      background-position: center;
      background-size: cover;
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 10;
    }
    .image-item {
      z-index: 11;
    }
  }

  .slideshow-current-count {
    position: fixed;
    right: 0;
    bottom: 0;
    padding: 40px;
    z-index: 12;
    font-size: 18px;

    p {
      margin: 0;
    }
  }
</style>
