<script>
import { mapActions, mapState } from 'vuex'
import CircaSearch from '@/components/CircaSearch'

export default {
  name: 'circa-header',

  components: {
    CircaSearch
  },

  data () {
    return {
      categories: ['ceiling', 'wall', 'table', 'floor', 'outdoor', 'fans']
    }
  },

  mounted () {
    this.initData()
  },

  computed: {
    ...mapState({
      alertMessage (state) {
        return state.alert.message
      },
      alertType (state) {
        return state.alert.type
      },
      username (state) {
        return state.auth.username
      }
    }),
    isAdminRoute () {
      return this.$route.path.includes('admin')
    },
    logoRouterTo () {
      return this.isAdminRoute ? '/admin' : '/collections'
    }
  },

  methods: {
    ...mapActions({
      initData: 'products/init',
      logoutUser: 'auth/logoutUser'
    }),
    handlize (value) {
      return value.toLowerCase().replace(' ', '-')
    }
  }
}
</script>

<template>
  <div class="top-header-wrapper" :class="{isAdminRoute: isAdminRoute}">

    <div class="alert-wrapper" v-if="alertType">
      <circa-alert :type="alertType">
        {{alertMessage}}
      </circa-alert>
    </div>

    <div class="top-header">
      <div class="logo-wrapper">
        <router-link :to="logoRouterTo">
          <img src="../assets/circa-logo.png">
        </router-link>
      </div>
      <div class="menu-wrapper">
        <ul v-if="!isAdminRoute">
          <li v-for="(category, i) in categories" :key="i">
            <router-link :to="{ name: 'Collection', params: { collectionHandle: handlize(category), subCollectionHandle: 'view-all' }}">{{category}}</router-link>
          </li>
          <li>
            <circa-search />
          </li>
        </ul>
        <ul v-else>
          <li>
            <i class="fas fa-user-circle"></i> Welcome {{username}}
          </li>
          <li>
            <circa-button @click.native="logoutUser($router)">Log Out</circa-button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  @import "../assets/sass/abstracts/index";

  .top-header-wrapper {
    position: relative;
    z-index: 10;
    background: #fff;
  }

  .alert-wrapper {
    .circa-alert-wrapper {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      margin-top: 0;
    }
  }

  .top-header {
    padding: $container-padding;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 120px;

    .isAdminRoute & {
      height: 100px;
      box-shadow: 0 1px 10px 0 rgba(51,51,51,0.15);
    }

    .logo-wrapper {
      img {
        max-width: 265px;
      }
    }

    .menu-wrapper {
      ul {
        padding: 0;
        li {
          display: inline-block;
          vertical-align: middle;
          padding: 0 16px;
          font-size: 19px;
          text-transform: capitalize;

          @media (max-width: 1060px) {
            padding: 0 14px;
          }

          a {
            display: block;
            text-decoration: none;
            color: #666666;
            line-height: 46px;
            text-transform: capitalize;

            &.router-link-active {
              font-weight: 500;
            }
          }

          .fa {
            color: #BEBEBE;
          }
        }
      }
    }
  }
</style>
