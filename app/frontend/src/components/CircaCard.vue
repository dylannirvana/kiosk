<script>
export default {
  name: 'circa-card'
}
</script>

<template>
  <div class="card-wrapper">
    <slot />
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  .card-wrapper {
    padding: 20px;
    background: #fff;
    border: 1px solid #E1E1E1;
    border-radius: 5px;
  }
</style>
