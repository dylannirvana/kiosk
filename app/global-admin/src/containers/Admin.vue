<template>
  <div class="admin-dash-wrapper">
    <div class="admin-dash">
      <circa-bread-crumbs v-if="$route.name === 'Logs'" class="bread-crumbs" />
      <circa-actions-bar class="actions-bar" />
      <router-view />
    </div>
  </div>
</template>

<script>
import CircaActionsBar from '@/components/CircaActionsBar'
import CircaCard from '@/components/CircaCard'
import { mapState } from 'vuex'

export default {
  name: 'Admin',

  components: {
    CircaActionsBar,
    CircaCard
  },

  computed: {
    ...mapState({
      userIsAuthorized (state) {
        return state.currentUser.isAuthorized
      }
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  @import "../assets/sass/abstracts/index";
  .admin-dash-wrapper {
    overflow: scroll;
    z-index: 1;
  }

  .admin-dash {
    @extend %container-admin;
  }

  .bread-crumbs {
    margin-top: 30px;
  }

  .actions-bar {
    margin-top: 30px;
    margin-bottom: 50px;
  }

</style>
