<script>
import Flickity from 'vue-flickity'
import Helpers from '@/services/helpers-service'

export default {
  name: 'circa-sub-category-slider',

  components: { Flickity },

  props: {
    category: {
      type: String
    },
    subCategories: {
      type: Array
    },
    value: {
      type: Object
    }
  },

  data () {
    return {
      flickityOptions: {
        freeScroll: true,
        contain: true,
        prevNextButtons: false,
        pageDots: false,
        cellAlign: 'left'
      },
      slides: []
    }
  },

  mounted () {
    this.$nextTick(() => {
      this.$refs.flickity.select(0, false, true)
      this.checkSlider()
    })
  },

  methods: {
    dynamicPath: Helpers.dynamicPath,
    selectSlide (slide, index) {
      this.$refs.flickity.select(index, false, true)
      this.$emit('input', slide)
    },
    isSlideActive (slide) {
      return this.$route.params.subCollectionHandle === slide.label.toLowerCase().replace(' ', '-')
    },
    checkSlider () {
      const rerenderInterval = setInterval(() => {
        const sliderWrapperHeight = this.$refs.flickityWrapper.clientHeight
        if (sliderWrapperHeight === 0) {
          this.$refs.flickity.rerender()
        } else {
          clearInterval(rerenderInterval)
        }
      }, 100)
    }
  },

  watch: {
    $route () {
      // Reset slider if view-all is selected
      if (this.$route.path.includes('view-all')) {
        this.$refs.flickity.select(0, false, true)
      }
    },
    subCategories: {
      handler () {
        this.slides = [...this.subCategories].sort((a, b) => {
          if (a.label === 'view all' || b.label === 'view all') return 1
          return a.label - b.label
        })
        if (this.value !== undefined) {
          this.$nextTick(() => {
            this.$refs.flickity.rerender()
            const activeSlideIndex = this.slides.map(category => category.label).indexOf(this.value.label)
            this.selectSlide(this.value, activeSlideIndex)
          })
        }
      },
      immediate: true
    }
  }
}
</script>

<template>
  <div class="sub-category-slider-wrapper" ref="flickityWrapper">
    <flickity ref="flickity" :options="flickityOptions">
      <div class="slide-item-wrapper carousel-cell" v-for="(slide, index) in subCategories" :class="{isSelected: isSlideActive(slide)}" @click="selectSlide(slide, index)" :key="index">
        <div class="slide-item aspect-content" :style="{ backgroundImage: `url(${ dynamicPath(slide.img_thumbnail) })` }">
          <div class="slide-title-wrapper">
            <h4 class="slide-title">{{slide.label}}</h4>
          </div>
        </div>
      </div>
    </flickity>
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
  @import "../assets/sass/abstracts/index";
  .sub-category-slider-wrapper {
    padding: 0 8% $container-padding;
    overflow: hidden;

    .flickity-viewport {
      overflow: visible;
    }

    .slide-item-wrapper {
      @include aspect-ratio(1.75, 1);
      width: calc(20% - 20px);
      margin-right: 10px;

      &.isSelected {
        .slide-item {
          border: 1px solid #666666;
        }
      }

      .slide-item {
        border-radius: 5px;
        overflow: hidden;
        background-position: center;
        background-size: cover;
        display: flex;
        align-items: flex-end;

        .slide-title-wrapper {
          display: flex;
          align-items: flex-end;
          width: 100%;
          text-align: center;
          height: 100%;
          background: linear-gradient(to top, rgba(255,255,255,0.85) 0%,rgba(255,255,255,0) 100%);

          .slide-title {
            margin-bottom: 5px;
            width: 100%;
            font-weight: 300;
            font-size: 12px;
            color: #666666;
            text-transform: uppercase;
          }
        }
      }
    }
  }
</style>
