<script>
import Helpers from '@/services/helpers-service'

export default {
  name: 'circa-image',

  props: {
    src: {
      type: String
    },
    ratio: {
      type: Number,
      default: 1
    },
    groupedImage: {
      type: Boolean
    },
    allThumbsLoaded: {
      type: Boolean
    },
    thumb: {
      type: String
    },
    alt: {
      type: String
    },
    isProductImg: {
      type: Boolean
    }
  },

  data () {
    return {
      mainImageLoaded: false,
      thumbImageLoaded: false,
      timer: 0
    }
  },

  computed: {
    largeImageReady () {
      return this.groupedImage ? (this.allThumbsLoaded || this.mainImageLoaded) : this.thumbImageLoaded
    },
    spacerBlockStyles () {
      return {
        paddingBottom: ((1 / this.ratio) * 100) + '%'
      }
    }
  },

  methods: {
    dynamicPath: Helpers.dynamicPath
  },

  watch: {
    thumbImageLoaded () {
      this.$emit('imageLoaded', true)
    }
  }
}
</script>

<template>
  <div class="circa-image-wrapper">
    <div class="space-block" :style="spacerBlockStyles"></div>
    <img v-show="!largeImageReady" :src="dynamicPath(thumb)" @load="thumbImageLoaded = true" :alt="alt" :inspectlet-src="'http://circascreens.com' + thumb"/>
    <img v-show="largeImageReady" :src="dynamicPath(src)" @load="mainImageLoaded = true" :alt="alt" :inspectlet-src="'http://circascreens.com' + src"/>
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.circa-image-wrapper {
  width: 100%;
  display: inline-block;
  max-width: 100%;
  position: relative;

  .space-block {
    padding-bottom: 100%;
  }

  img {
    width: 100%;
    max-width: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }

  .thumb-img {
    -webkit-filter: blur(4px);
  }
}
</style>
