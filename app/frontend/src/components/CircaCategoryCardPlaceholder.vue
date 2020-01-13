<script>
export default {
  name: 'circa-category-card-placeholder',

  props: {
    title: {
      type: String
    }
  }
}
</script>

<template>
  <div class="category-card-wrapper-placeholder">
    <div class="aspect-content">
      <router-link :to="'/collection/' + title + '/view-all'">
        <div class="category-title-wrapper">
          <h3 class="category-title" v-if="title">
            {{title | capitalize}}
          </h3>
        </div>
      </router-link>
    </div>
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  @import "../assets/sass/abstracts/index";
  .fade-enter-active, .fade-leave-active {
    transition: opacity 1s;
  }
  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }
  .category-card-wrapper-placeholder {
    @include aspect-ratio(1, 1.16);
    background-color: #f7f7f7;
    border-radius: 5px;
    overflow: hidden;

    .aspect-content {
      a {
        color: inherit;
      }
    }

    .category-title-wrapper {
      display: flex;
      justify-content: center;
      align-items: flex-end;

      width: 100%;
      height: 100px;

      position: absolute;
      bottom: 0;
      z-index: 3;

      .category-title {
        text-align: center;
        text-transform: uppercase;
        font-family: "Bookman Old Style";
        font-size: 18px;
        font-weight: 400;
        line-height: 60px;
        margin: 0;
      }
    }
  }
</style>
