<script>
export default {
  name: 'circa-slideshow-card',

  props: {
    slide: {
      type: Object,
      default () {
        return {
          label: false
        }
      }
    }
  }
}
</script>

<template>
  <div class="slideshow-card-wrapper">
    <div class="card-image-wrapper" :style="{backgroundImage: `url(/static/media/${slide.images[0].img})`}">
    </div>
    <div class="card-content">
      <h4 class="title">{{slide.label}}</h4>
      <circa-button class="play-btn small" :to="'/slideshows/' + slide.id" faIcon="fas fa-play">Play</circa-button>
    </div>
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  @import "../assets/sass/abstracts/index";
  .slideshow-card-wrapper {
    background: #fff;
    position: relative;
    width: 100%;
    border: 1px solid #E1E1E1;
    border-radius: 5px;
    overflow: hidden;
  }

  .card-image-wrapper {
    @include aspect-ratio(237, 300);
    background-repeat: no-repeat;
    background-size: cover;
    width: 100%;
  }

  .card-content {
    padding: 20px;

    .title {
      font-weight: 500;
    }
  }
</style>
