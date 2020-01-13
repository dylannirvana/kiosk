<template>
  <div class="create-slideshows-wrapper">
    <div class="breadcrumbs">
      <circa-bread-crumbs :backOnly="true"/>
    </div>
    <circa-card class="create-slideshows" :hasPadding="false">
      <div class="card-header">
        <p>Create Slideshows</p>
        <circa-button @click.native="uploadImages" class="save-slide-btn dark tiny">Save Slideshow</circa-button>
      </div>

      <div class="card-body">
        <circa-input class="slideshow-name" placeholder="Slideshow Name*" :value="slideshowName" v-model="slideshowName"/>
        <circa-drag-drop v-model="images"/>
      </div>
    </circa-card>
  </div>
</template>

<script>
import Api from '@/api'
import CircaSlideshowCard from '@/components/CircaSlideshowCard'
import CircaDragDrop from '@/components/CircaDragDrop'
import CircaCard from '@/components/CircaCard'
import { mapActions } from 'vuex'

export default {
  name: 'slideshows',

  data () {
    return {
      slideshowName: '',
      images: [],
      imagePaths: []
    }
  },

  components: {
    CircaSlideshowCard,
    CircaDragDrop,
    CircaCard
  },

  methods: {
    ...mapActions({
      setAlert: 'alert/setAlert',
      getSlideshows: 'slideshows/getSlideshows'
    }),
    saveSlideshow () {
      const data = {
        label: this.slideshowName,
        images: this.imagePaths.map((path, index) => {
          return {
            img: path,
            sort: index++
          }
        })
      }
      console.log('data', data)
      Api.post({
        path: '/slideshows/create',
        contentType: 'application/json',
        auth: true,
        data: {
          data: JSON.stringify(data)
        }
      }).then(response => {
        console.log('response', response)
        if (response.data.code === 200) {
          this.getSlideshows()
          this.setAlert({
            message: 'You have created a new slideshow successfully!',
            type: 'success'
          })
          this.$router.push('/admin/dashboard')
        } else {
          this.setAlert({
            message: 'Sorry there was an issue uploading your slideshow, please try again or contact an admin.',
            type: 'error'
          })
          console.log('error when creating slideshow')
        }
      })
    },
    uploadImages () {
      console.log('hello, trying to upload')
      let formData = new FormData()
      this.images.map((image, index) => {
        formData.append('upload', image)
      })

      Api.post({
        path: '/slideshows/images/upload',
        contentType: 'multipart/form-data',
        auth: true,
        data: formData
      }).then(response => {
        console.log('response 123', response)
        if (response.data.code === 200) {
          this.imagePaths = response.data.result.Output
          this.saveSlideshow()
        } else {
          console.log('error when uploading images')
        }
      })
    }
  },

  watch: {
    images (newImage, oldImage) {
      console.log('newImage', newImage)
      console.log('oldImage', oldImage)
    }
  }
}
</script>

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
