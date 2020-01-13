<template>
  <div class="slideshows-wrapper">
    <circa-drag-drop />
  </div>
</template>

<script>
import CircaSlideshowCard from '@/components/CircaSlideshowCard'
import CircaDragDrop from '@/components/CircaDragDrop'
import { mapState } from 'vuex'

export default {
  name: 'slideshows',

  components: {
    CircaSlideshowCard,
    CircaDragDrop
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
  .sync-slides-btn {
    margin-left: 20px;
  }

  .slideshow-cards-wrapper {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-column-gap: 20px;
    grid-row-gap: 20px;
    width: 100%;
    margin-top: 25px;
  }

  .slides-title {
    font-size: 21px;
  }
</style>
