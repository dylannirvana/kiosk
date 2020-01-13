<script>
import Helpers from '@/services/helpers-service'

export default {
  name: 'circa-category-card',

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
      imagesLoaded: []
    }
  },

  computed: {
    imagesReady () {
      return this.imagesLoaded.length === this.category.images.length
    }
  },

  mounted () {
    this.checkIfImagesLoaded()
  },

  beforeMount () {
    this.imageRotation = setInterval(() => {
      this.fromImageIndex = this.fromImageIndex === 2 ? 0 : this.fromImageIndex + 1
      this.toImageIndex = this.fromImageIndex === 2 ? 0 : this.fromImageIndex + 1
    },
    Math.floor(Math.random() * 60) * 100 + 5000)
  },

  beforeDestroy () {
    clearInterval(this.imageRotation)
  },

  methods: {
    dynamicPath: Helpers.dynamicPath,
    checkIfImagesLoaded () {
      this.category.images.map(imgSrc => {
        const img = new Image()

        img.onload = () => {
          this.imagesLoaded.push(true)
        }
        img.src = imgSrc

        if (img.complete) this.imagesLoaded.push(true)
      })
    }
  }
}
</script>

<template>
  <div class="category-card-wrapper">
    <div class="aspect-content">
      <router-link :to="'/collection/' + category.handle + '/view-all'">
        <div class="background-gallery-wrapper">
          <transition name="fade" v-for="(image, index) in category.images" v-if="imagesReady" :key="index">
            <div class="gallery-slide"
              v-if="index === fromImageIndex"
              :style="{backgroundImage: `url(${ dynamicPath(image) })`}"
            >
            </div>
          </transition>
          <div class="gallery-slide-bg"
            :style="{backgroundImage: `url(${ dynamicPath(category.thumbnail[1]) })`}"
          >
          </div>
        </div>
        <div class="category-title-wrapper">
          <h3 class="category-title" v-if="category.label">
            {{category.label}}
          </h3>
        </div>
      </router-link>
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
  .category-card-wrapper {
    @include aspect-ratio(1, 1.16);

    .aspect-content {
      border-radius: 5px;
      overflow: hidden;

      a {
        color: inherit;
      }
    }

    .background-gallery-wrapper {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: #f7f7f7;

      .gallery-slide {
        z-index: 2;
      }
      .gallery-slide,
      .gallery-slide-bg {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-position: center;
        background-size: cover;
        width: 100%;
        height: 100%;
      }
    }
    .category-title-wrapper {
      display: flex;
      justify-content: center;
      align-items: flex-end;
      width: 100%;
      height: 100px;

      position: absolute;
      bottom: 0;
      z-index: 3;

      .category-title {
        text-align: center;
        text-transform: uppercase;
        font-family: "Bookman Old Style";
        font-size: 18px;
        font-weight: 400;
        line-height: 60px;
        margin: 0;
      }
    }
  }
</style>
