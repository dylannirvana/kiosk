<template>
  <div class="bread-crumbs-wrapper">
    <ul>
      <li class="back-button">
        <a @click="$router.go(-1)"><i class="fas fa-chevron-left"></i> Back</a>
      </li>
      <li v-if="!backOnly" v-for="(breadCrumb, i) in breadCrumbs" :key="i">
        <router-link :to="breadCrumb.route"> {{breadCrumb.name}} </router-link>
        <span v-if="i + 1 !== breadCrumbs.length">/</span>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'circa-bread-crumbs',

  props: {
    backOnly: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    breadCrumbs () {
      let urlPathArray = this.$route.path.split('/')
      urlPathArray.shift()
      return urlPathArray.map((path, i) => {
        const route = i > -1 ? urlPathArray.slice(0, i + 1) : []
        return {
          name: path,
          route: `/${route.join('/')}`
        }
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  .bread-crumbs-wrapper {
    ul {
      list-style: none;
      padding: 0;

      li {
        display: inline-block;

        &.back-button {
          margin-right: 20px;
          cursor: pointer;

          .fas {
            margin-right: 10px;
          }
        }

        a {
          text-decoration: none;
          text-transform: capitalize;
          color: inherit;
        }

        span {
          margin: 0 15px 0 10px;
        }
      }
    }
  }
</style>
