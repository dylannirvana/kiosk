<template>
  <div class="logs-wrapper">
    <circa-card class="logs">
      <ul v-for="(log, index) in logs" class="log-item" :class="log.tbl.status" :key="index">
        <li>
          <span class="status-title">{{log.tbl.status | capitalize}}</span>:
          {{log.tbl.date | formatDate}}
        </li>
        <li>
          <span>From:</span>
          {{log.tbl.from}}
        </li>
        <li>
          <span>Message:</span>
          {{getMessage(log)}}
        </li>
      </ul>
    </circa-card>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import CircaCard from '@/components/CircaCard'

export default {
  name: 'logs',

  components: {
    CircaCard
  },

  computed: {
    ...mapState({
      logs (state) {
        return state.logs.all
      }
    })
  },

  mounted () {
    this.getLogs().then(response => {
      console.log('logs response', response)
    })
  },

  methods: {
    ...mapActions({
      getLogs: 'logs/getLogs'
    }),
    getMessage (log) {
      return log.tbl.status === 'success' ? log.tbl.payload : log.tbl.error
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  @import "../assets/sass/abstracts/index";

  .logs-wrapper {
    .logs {
      padding: 40px 60px;
    }
  }

  .log-item {
    list-style: none;
    padding-left: 50px;

    li {
      &:first-child {
        &:before {
          content: "---->";
          margin-left: -52px;
          margin-right: 18px;
        }
      }

      span {
        font-weight: 500;
      }
    }
  }

  .status-title {
    .success & {
      color: #81c14a;
    }
    .error & {
      color: #fd5f60;
    }
  }
</style>
