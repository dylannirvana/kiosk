<script>
export default {
  name: 'circa-card',
  props: {
    hasPadding: {
      type: Boolean,
      default: true
    }
  }
}
</script>

<template>
  <div class="card-wrapper" :class="{hasPadding: hasPadding}">
    <slot />
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  .card-wrapper {
    background: #fff;
    border: 1px solid #E1E1E1;
    border-radius: 5px;

    &.hasPadding {
      padding: 20px;
    }
  }
</style>
