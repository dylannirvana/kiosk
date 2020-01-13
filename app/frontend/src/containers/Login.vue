<template>
  <div class="login-page-wrapper" :class="{loginError: loginError}" :style="{backgroundImage: `url(${backgroundImage})`}">
    <div class="login-wrapper">
      <img class="circa-logo" src="../assets/circa-logo-transparent.png">
      <circa-input placeholder="Username*" :required="true" :value="credentials.username" v-model="credentials.username"></circa-input>
      <circa-input placeholder="Password*" type="password" @keyup.enter="handleLoginClick" :required="true" :value="credentials.password" v-model="credentials.password"></circa-input>
      <p class="error-message">Sorry there was an issue trying to log you in, please confirm username and password are correct.</p>
      <circa-button class="login-btn dark small" @click.native="handleLoginClick">Login</circa-button>
      <router-link class="back-btn" to="/">
        <i class="fas fa-chevron-left"></i> Back to Endless Aisle
      </router-link>
    </div>
  </div>
</template>

<script>
import {mapState, mapActions} from 'vuex'
export default {
  name: 'Login',
  data () {
    return {
      backgroundImage: require('../assets/imgs/circa-lighting-login-bg.jpg'),
      credentials: {
        username: '',
        password: ''
      },
      loginError: false
    }
  },
  mounted () {
    if (this.isAuthorized) {
      this.$router.push('/admin')
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

  .login-page-wrapper {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-position: center;
    background-size: cover;
    z-index: 10;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  .login-wrapper {
    background-color: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(4px);
    border: solid #e1e1e1 1px;
    border-bottom-left-radius: 5px;
    width: 400px;
    text-align: center;
    padding: 60px 40px;
  }

  .circa-logo {
    max-width: 230px;
  }

  .login-btn {
    width: 200px;
    max-width: 100%;
    margin-top: 20px;
  }

  .back-btn {
    display: block;
    text-align: center;
    font-size: 14px;
    margin-top: 30px;
  }
</style>
