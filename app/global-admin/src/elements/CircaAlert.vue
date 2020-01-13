<template>
  <div class="circa-alert-wrapper" :class="type">
    <p>
      <slot />
    </p>
  </div>
</template>

<script>

export default {
  name: 'circa-alert',
  props: {
    type: {
      type: String,
      default: ''
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  .circa-alert-wrapper {
    border-radius: 5px;
    font-size: 12px;
    padding: 15px 20px;
    margin-bottom: 0;
    margin-top: 10px;

    &.error {
      background: #fdb5b5;
    }

    &.success {
      background: #c6fdb8;
    }

    p {
      margin: 0;
    }
  }
</style>
