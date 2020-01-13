<template>
  <div class="login-info-wrapper"  :class="{loginError: loginError}">
    <circa-input placeholder="Username*" :required="true" :value="credentials.username" v-model="credentials.username"></circa-input>
    <circa-input placeholder="Password*" type="password" @keyup.enter="handleLoginClick" :required="true" :value="credentials.password" v-model="credentials.password"></circa-input>
    <p class="error-message">Sorry there was an issue trying to log you in, please confirm username and password are correct.</p>
    <circa-button class="login-btn dark small" @click.native="handleLoginClick">Login</circa-button>
    <div class="reset-wrapper">
      <router-link to="/auth/reset" class="reset-btn">Reset Password</router-link>
    </div>
  </div>
</template>

<script>
import {mapState, mapActions} from 'vuex'
export default {
  name: 'Login',
  data () {
    return {
      credentials: {
        username: '',
        password: ''
      },
      loginError: false
    }
  },
  computed: {
    ...mapState({
      isAuthorized (state) {
        return state.auth.isAuthorized
      }
    })
  },
  methods: {
    ...mapActions({
      authorizeUser: 'auth/authorizeUser'
    }),
    handleLoginClick () {
      this.authorizeUser(this.credentials).then(response => {
        if (response.code === 200) {
          this.$router.push('/admin')
        } else {
          this.loginError = true
        }
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  @import "../assets/sass/abstracts/index";
  .error-message {
    background: rgba(255, 0, 0, 0.1);
    border-radius: 5px;
    display: none;
    font-size: 12px;
    padding: 10px;
    margin-bottom: 0;

    .loginError & {
      display: block;
    }
  }

  .circa-logo {
    max-width: 230px;
  }

  .login-btn {
    display: inline-block;
    width: 200px;
    max-width: 100%;
    margin-top: 20px;
  }

  .reset-wrapper {
    margin-top: 30px;
  }

  .reset-btn {
    color: inherit;
    font-size: 14px;
    text-align: center;
    text-decoration: none;
    border-bottom: solid 1px #333;
  }
</style>
