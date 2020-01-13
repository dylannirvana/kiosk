<script>
import CircaSearch from '@/components/CircaSearch'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'circa-header',

  components: {
    CircaSearch
  },

  computed: {
    ...mapState({
      alertMessage (state) {
        return state.alert.message
      },
      alertType (state) {
        return state.alert.type
      },
      currentUser (state) {
        return state.users.current
      }
    })
  },

  methods: {
    ...mapActions({
      logoutUser: 'auth/logoutUser'
    })
  }
}
</script>

<template>
  <div class="top-header-wrapper">

    <div class="alert-wrapper" v-if="alertType">
      <circa-alert :type="alertType">
        {{alertMessage}}
      </circa-alert>
    </div>

    <div class="top-header">
      <div class="logo-wrapper">
        <router-link to="/admin">
          <img src="../assets/circa-logo.png">
        </router-link>
      </div>
      <div class="menu-wrapper">
        <ul>
          <li>
            <i class="fas fa-user-circle"></i> Welcome {{currentUser.name}}
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
    box-shadow: 0 1px 10px 0 rgba(51,51,51,0.15);
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
    @extend %container-admin;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100px;

    .logo-wrapper {
      img {
        max-width: 210px;
      }
    }

    .menu-wrapper {
      ul {
        padding: 0;
        li {
          display: inline-block;
          vertical-align: middle;
          padding: 0 19px;
          font-size: 19px;

          a {
            display: block;
            text-decoration: none;
            color: inherit;
            line-height: 46px;
          }

          .fa {
            color: #BEBEBE;
          }
        }
      }
    }
  }
</style>
