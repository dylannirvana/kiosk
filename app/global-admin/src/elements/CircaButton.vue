<template>
  <a v-if="href" :href="href" class="circa-button-wrapper" target=”_blank”>
    <i v-if="faIcon" :class="faIcon"></i>
    <slot />
  </a>
  <router-link v-else :to="to" class="circa-button-wrapper">
    <i v-if="faIcon" :class="faIcon"></i>
    <slot />
  </router-link>
</template>

<script>

export default {
  name: 'circa-button',
  props: {
    faIcon: {
      type: String,
      default: ''
    },
    href: {
      type: String,
      default: ''
    },
    to: {
      type: String,
      default: ''
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  .circa-button-wrapper {
    background-color: #FFFFFF;
    border-radius: 5px;
    border: 1px solid #E1E1E1;
    cursor: pointer;
    display: inline-block;
    font-size: 14px;
    line-height: 50px;
    padding: 0 40px;
    color: inherit;
    text-decoration: none;
    text-align: center;

    &.full {
      width: 100%;
    }

    &.stacked {
      margin-bottom: 10px;
    }

    &.small {
      line-height: 40px;
      padding: 0 20px;
    }

    &.tiny {
      line-height: 30px;
      padding: 2px 10px 0;

      i {
        margin-right: 5px;
        font-size: 9px;
      }
    }

    &.dark {
      background-color: #666;
      color: #fff;
    }

    i {
      margin-right: 10px;
      vertical-align: middle;
    }
  }
</style>
