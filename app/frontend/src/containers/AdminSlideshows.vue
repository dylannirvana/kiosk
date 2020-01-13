<template>
  <div class="slideshows-wrapper">
    <div class="slideshows">
      <p>{{msg}}</p>
      <span class="slides-title">Select a Slideshow</span> <circa-button @click.native="sync('slideshows')" class="sync-slides-btn" faIcon="fas fa-sync">Sync Slideshows</circa-button>
      <div class="slideshow-cards-wrapper">
        <circa-slideshow-card v-for="(slide, index) in slideshows" :slide="slide" :key="index"/>
      </div>
    </div>
  </div>
</template>

<script>
import CircaSlideshowCard from '@/components/CircaSlideshowCard'
import { mapState, mapActions } from 'vuex'
import Api from '@/api'

export default {
  name: 'admin-slideshows',

  components: {
    CircaSlideshowCard
  },

  methods: {
    ...mapActions({
      setAlert: 'alert/setAlert',
      getSlideshows: 'slideshows/getSlideshows'
    }),
    sync (path) {
      return Api.get(`/sync/${path}`).then(response => {
        let message = ''
        let alertType = ''

        if (response.data && response.data.code === 200) {
          message = 'Thank you, everything is syncing successfully.'
          if (path !== 'all') { message = `Thank you, ${path} are syncing successfully.` }
          alertType = 'success'
          this.getSlideshows()
        } else {
          message = 'Oops, syncing failed. Please try again or contact admin.'
          alertType = 'error'
        }

        this.setAlert({
          message: message,
          type: alertType
        })
      })
    }
  },

  computed: {
    ...mapState({
      slideshows (state) {
        return state.slideshows.all
      },
      msg (state) {
        return state.alert.message
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
