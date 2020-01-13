<template>
  <div class="reset-info-wrapper">
    <p class="intro-text center">Please contact your account administrator to reset your password.</p>
    <!-- <p class="intro-text">Enter your email and we’ll send you link to rest your password.</p>
    <circa-input placeholder="Email*" :required="true" :value="email" v-model="email"></circa-input>
    <p class="message error" v-if="resetError">Sorry, there was an issue trying to reset your password. Please try again, or contact admin.</p>
    <p class="message success" v-if="resetSuccess">A reset password email has been sent, please check your inbox for further instructions.</p>
    <circa-button class="reset-btn dark small" @click.native="handleResetClick">Reset Password</circa-button> -->
    <circa-button class="reset-btn dark small" to="/auth/login">Back to Login</circa-button>
    <!-- <div class="reset-wrapper">
      <router-link to="/auth/login" class="back-btn">Back to Login</router-link>
    </div> -->
  </div>
</template>

<script>
import {mapActions} from 'vuex'
export default {
  name: 'ResetPassword',
  data () {
    return {
      email: '',
      resetError: false,
      resetSuccess: false
    }
  },
  methods: {
    ...mapActions({
      resetPassword: 'auth/resetPassword'
    }),
    handleResetClick () {
      this.resetPassword(this.email).then(response => {
        if (response.code === 200) {
          this.email = ''
          this.resetSuccess = true
          this.resetError = false
        } else {
          this.resetError = true
          this.resetSuccess = false
        }
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  @import "../assets/sass/abstracts/index";
  .intro-text {
    font-size: 14px;
    text-align: left;
    max-width: 250px;

    &.center {
      text-align: center;
      max-width: 100%;
    }
  }

  .message {
    border-radius: 5px;
    font-size: 12px;
    padding: 10px;
    margin-bottom: 0;

    &.error {
      background: rgba(255, 0, 0, 0.1);
    }

    &.success {
      background: rgba(94, 232, 37, 0.3);
    }
  }

  .circa-logo {
    max-width: 230px;
  }

  .reset-btn {
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
