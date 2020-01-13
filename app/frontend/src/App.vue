<template>
  <div id="app">
    <CircaHeader></CircaHeader>
    <router-view v-if="singlePageDataLoaded"/>
    <div v-else class="loading-screen">
      <img src="./assets/circa-logo.png">
    </div>
  </div>
</template>

<script>
import CircaHeader from '@/components/CircaHeader'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'App',

  components: {
    CircaHeader
  },

  computed: {
    ...mapState({
      singlePageDataLoaded (state) {
        // Make sure all data is loaded for single pages, before attepting to render page
        return this.$route.name.includes('Product') ? state.products.loaded && state.categories.loaded : true
      }
    })
  },

  mounted () {
    const screenSize = this.$route.query.screen
    if (!screenSize) {
      this.setScreenSize(!localStorage.getItem('screenSize') ? 90 : localStorage.getItem('screenSize'))
      return
    }

    localStorage.setItem('screenSize', this.$route.query.screen)
    this.setScreenSize(this.$route.query.screen)
  },

  methods: {
    ...mapActions({
      setScreenSize: 'productListSingle/setScreenSize'
    })
  }
}
</script>

<style lang="scss">
  @import "@/assets/sass/styles.scss";

  .loading-screen {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    animation: pulse 3s infinite;

    img {
      margin-bottom: 100px;
    }
  }

  @keyframes pulse {
    0% {
      // transform: scale(1);
      opacity: 1;
    }
    50% {
      // transform: scale(1.05);
      opacity: 0.5;
    }
    100% {
      // transform: scale(1);
      opacity: 1;
    }
  }
</style>
