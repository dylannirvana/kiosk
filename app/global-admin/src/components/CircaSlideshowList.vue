
<template>
  <div class="slideshow-list-wrapper">
    <circa-card class="slideshow-header">
      <p>
        Slideshows <span class="slides-count">{{slideshows.length}} / 100</span>
      </p>
      <circa-button class="add-slide-btn tiny" to="/slideshows/create" faIcon="fas fa-plus">Add Slideshow</circa-button>
    </circa-card>

    <div class="slideshow-list">
      <div v-for="(slide, index) in slideshows" class="slide-card-item" :key="index">
        <circa-slideshow-card :slide="slide" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import CircaSlideshowCard from '@/components/CircaSlideshowCard'
import CircaCard from '@/components/CircaCard'

export default {
  name: 'circa-slideshow-list',

  components: {
    CircaSlideshowCard,
    CircaCard
  },

  computed: {
    ...mapState({
      slideshows (state) {
        return state.slideshows.all
      }
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  @import "../assets/sass/abstracts/index";

  .slideshow-list-wrapper {
    .slideshow-header {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      padding: 15px 30px;

      p {
        margin: 0;
        vertical-align: middle;
        font-size: 21px;

        .slides-count {
          color: #666667;
          font-size: 16px;
        }
      }
    }
  }

  .add-slide-btn {
    margin-left: auto;
  }

  .slideshow-list {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -5px;
  }

  .slide-card-item {
    width: 16.667%;
    min-width: 196px;
    padding: 5px;
  }

</style>
