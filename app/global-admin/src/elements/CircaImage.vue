<template>
  <div class="circa-image-wrapper">
    <div v-if="!isLoaded" class="image-placeholder" :style="{paddingBottom: aspectRatio * 100 + '%'}"></div>
    <img v-else :src="src" :alt="alt">
  </div>
</template>

<script>

export default {
  name: 'circa-image',

  props: {
    src: {
      type: String
    },
    alt: {
      type: String
    }
  },

  data () {
    return {
      dimensions: {},
      isLoaded: false
    }
  },

  computed: {
    img () {
      const img = document.createElement('img')
      img.src = this.src
      return img
    },
    aspectRatio () {
      return this.dimensions.width / this.dimensions.height
    }
  },

  mounted () {
    const poll = setInterval(() => {
      if (this.img.naturalWidth) {
        clearInterval(poll)
        this.dimensions = {
          width: this.img.naturalWidth,
          height: this.img.naturalHeight
        }
      }
    }, 10)
    this.img.onload = () => {
      this.isLoaded = true
      this.$emit('input', true)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.circa-image-wrapper {
  width: 100%;
  display: inline-block;
  max-width: 100%;

  .image-placeholder {
    background: #f7f7f7;
  }

  img {
    width: 100%;
    max-width: 100%;
  }
}
</style>
