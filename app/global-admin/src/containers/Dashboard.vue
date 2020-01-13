<template>
  <div class="dashboard-wrapper" :class="userRole">
    <div class="dashboard">
      <div class="user-list-wrapper">
        <circa-user-list />
      </div>
      <div class="slideshow-list-wrapper">
        <circa-slideshow-list />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import CircaSlideshowList from '@/components/CircaSlideshowList'
import CircaUserList from '@/components/CircaUserList'

export default {
  name: 'dashboard',

  components: {
    CircaSlideshowList,
    CircaUserList
  },

  mounted () {
    this.getAllUsers()
  },

  computed: {
    ...mapState({
      userRole (state) {
        return state.currentUser.role
      }
    })
  },

  methods: {
    ...mapActions({
      getAllUsers: 'users/getAll'
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  @import "../assets/sass/abstracts/index";
  .dashboard {
    display: grid;
    grid-template-columns: 1fr;
    grid-gap: 8.666%;

    .admin & {
      grid-template-columns: 5fr 6fr;
    }
  }
</style>
