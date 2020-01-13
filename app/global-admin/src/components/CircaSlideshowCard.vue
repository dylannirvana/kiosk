<script>
import Api from '@/api'
import { mapActions } from 'vuex'

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
  },

  methods: {
    ...mapActions({
      setAlert: 'alert/setAlert',
      getSlideshows: 'slideshows/getSlideshows'
    }),
    deleteSlideshow (slideshow) {
      Api.post({
        path: `/slideshows/delete/${slideshow.id}`,
        contentType: 'application/json',
        auth: true,
        data: {
          id: slideshow.id
        }
      }).then(response => {
        if (response.data.code === 200) {
          this.setAlert({
            message: 'You have deleted a slideshow successfully!',
            type: 'success'
          })
          this.getSlideshows()
        } else {
          this.setAlert({
            message: 'Sorry there was an issue deleting the slideshow, please try again or contact an admin.',
            type: 'error'
          })
          console.log('error when deleteing slideshow')
        }
      })
    }
  },

  computed: {
    imgPath () {
      const baseUrl = window.location.origin
      return `${baseUrl}/static/media${this.slide.images[0].img}`
    }
  }
}
</script>

<template>
  <div class="slideshow-card-wrapper">
    <div class="card-image-wrapper" :style="{backgroundImage: `url(${imgPath})`}">
    </div>
    <div class="card-content">
      <h4 class="title">{{slide.label}}</h4>
      <circa-button :to="'/slideshows/edit/' + slide.id" class="play-btn tiny" faIcon="fas fa-pencil-alt"><span>Edit</span></circa-button>
      <circa-button class="play-btn tiny" faIcon="fas fa-trash" @click.native="deleteSlideshow(slide)"><span>Delete</span></circa-button>
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
    padding: 19px;

    .title {
      font-weight: 500;
    }
  }
</style>
