<script>
import Api from '@/api'
import CircaSlideshowCard from '@/components/CircaSlideshowCard'
import CircaEditSlideshows from '@/components/CircaEditSlideshows'
import CircaCard from '@/components/CircaCard'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'slideshowsEdit',

  data () {
    return {
      newData: {},
      newImagePaths: []
    }
  },

  components: {
    CircaSlideshowCard,
    CircaEditSlideshows,
    CircaCard
  },

  computed: {
    ...mapState({
      slideshow (state) {
        return state.slideshows.all.filter(slide => slide.id === this.$route.params.id)[0]
      }
    })
  },

  methods: {
    ...mapActions({
      setAlert: 'alert/setAlert',
      getSlideshows: 'slideshows/getSlideshows'
    }),
    updateSlideshow () {
      const oldImages = !this.newData.images ? this.slideshow.images : this.newData.images
      const newImages = this.newImagePaths.length > 0 ? this.newImagePaths.map((path, index) => {
        return {
          img: path,
          sort: this.newData.images.length + index++
        }
      }) : []

      const data = {
        label: this.slideshow.label,
        images: newImages.concat(oldImages)
      }

      Api.post({
        path: `/slideshows/update/${this.$route.params.id}`,
        contentType: 'application/json',
        auth: true,
        data: {
          data: JSON.stringify(data)
        }
      }).then(response => {
        if (response.data.code === 200) {
          this.setAlert({
            message: 'You have updated a slideshow successfully!',
            type: 'success'
          })
          this.$router.push('/admin/dashboard')
          this.getSlideshows()
        } else {
          this.setAlert({
            message: 'Sorry there was an issue updating your slideshow, please try again or contact an admin.',
            type: 'error'
          })
          console.log('error when updating slideshow')
        }
      })
    },
    uploadImages () {
      const noNewFiles = this.newData.files ? this.newData.files.length === 0 : true
      if (noNewFiles) {
        this.updateSlideshow()
        return
      }
      let formData = new FormData()
      this.newData.files.map((file, index) => {
        formData.append('upload', file)
      })

      Api.post({
        path: '/slideshows/images/upload',
        contentType: 'multipart/form-data',
        auth: true,
        data: formData
      }).then(response => {
        if (response.data.code === 200) {
          this.newImagePaths = response.data.result.Output
          this.updateSlideshow()
        } else {
          console.log('error when uploading images')
        }
      })
    }
  }
}
</script>

<template>
  <div class="create-slideshows-wrapper">
    <div class="breadcrumbs">
      <circa-bread-crumbs :backOnly="true"/>
    </div>
    <circa-card class="create-slideshows" :hasPadding="false">
      <div class="card-header">
        <p>Edit Slideshow</p>
        <circa-button @click.native="uploadImages" class="save-slide-btn dark tiny">Update Slideshow</circa-button>
      </div>

      <div class="card-body">
        <circa-input class="slideshow-name" placeholder="Slideshow Name*" :value="slideshow.label" v-model="slideshow.label"/>
        <circa-edit-slideshows :images="slideshow.images" v-model="newData"/>
      </div>
    </circa-card>
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  @import "../assets/sass/abstracts/index";

  .create-slideshows,
  .breadcrumbs {
    @extend %container-admin;
    padding: 0;
    margin-top: 40px;
  }

  .create-slideshows {
    margin-top: 0;
  }

  .card-header {
    display: flex;
    align-items: center;
    padding: 15px 30px;
    border-bottom: 1px solid #E1E1E1;

    p {
      margin: 0;
      vertical-align: middle;
      font-size: 21px;
    }

    .save-slide-btn {
      margin-left: auto;
    }
  }

  .card-body {
    padding: 30px;
  }

  .slideshow-name {
    width: 300px;
    margin-bottom: 30px;
  }
</style>
