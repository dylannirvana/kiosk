<template>
  <div class="auth-page-wrapper" :style="{backgroundImage: `url(${backgroundImage})`}">
    <div class="auth-wrapper">
      <img class="circa-logo" src="../assets/circa-logo-transparent.png">
      <router-view/>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Auth',
  data () {
    return {
      backgroundImage: require('../assets/imgs/circa-lighting-login-bg.jpg')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  @import "../assets/sass/abstracts/index";
  .auth-page-wrapper {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-position: center;
    background-size: cover;
    z-index: 10;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  .auth-wrapper {
    background-color: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(4px);
    border: solid #e1e1e1 1px;
    border-bottom-left-radius: 5px;
    width: 400px;
    text-align: center;
    padding: 60px 40px;
  }

  .circa-logo {
    max-width: 230px;
  }
</style>
