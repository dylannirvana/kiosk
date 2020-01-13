<template>
  <div id="app">
    <CircaHeader></CircaHeader>
    <router-view/>
  </div>
</template>

<script>
import CircaHeader from '@/components/CircaHeader'
export default {
  name: 'App',
  components: {
    CircaHeader
  }
}
</script>

<style lang="scss">
  @import "@/assets/sass/styles.scss";
</style>
