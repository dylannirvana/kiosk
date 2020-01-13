<script>
import Api from '@/api'
import { mapActions } from 'vuex'

export default {
  name: 'circa-actions-bar',

  data () {
    return {
      msg: '',
      alertType: ''
    }
  },

  methods: {
    ...mapActions({
      getSlideshows: 'slideshows/getSlideshows'
    }),
    sync (path) {
      return Api.get(`/sync/${path}`).then(response => {
        if (response.data && response.data.code === 200) {
          this.msg = 'Thank you, everything is syncing successfully.'
          if (path !== 'all') { this.msg = `Thank you, ${path} are syncing successfully.` }
          this.alertType = 'success'
          this.getSlideshows()
        } else {
          this.msg = 'Oops, syncing failed. Please try again or contact admin.'
          this.alertType = 'error'
        }

        setTimeout(() => {
          this.msg = ''
          this.alertType = ''
        }, 3000)
      })
    }
  }
}
</script>

<template>
  <div class="actions-bar-wrapper">
    <div class="actions-bar">
      <circa-button @click.native="sync('feed')" class="sync-btn" faIcon="fas fa-sync">Sync Product Feed</circa-button>
      <circa-button @click.native="sync('push/images')" class="sync-btn" faIcon="fas fa-sync">Sync Images</circa-button>
      <circa-button v-if="$route.name !== 'Logs'" class="logs-btn" faIcon="fas fa-code" to="/admin/logs">View Logs</circa-button>
    </div>
    <circa-alert v-if="alertType" :type="alertType">
      {{msg}}
    </circa-alert>
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  .actions-bar-wrapper {
    .actions-bar {
      display: flex;
      padding: 20px;
      background: #fff;
      border: 1px solid #E1E1E1;
      border-radius: 5px;
      .sync-btn {
        margin-right: 10px;
      }
      .logs-btn {
        margin-left: auto;
      }
    }
  }
</style>
