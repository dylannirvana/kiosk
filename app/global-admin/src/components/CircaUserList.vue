
<template>
  <div class="user-list-wrapper">

    <div class="user-list-header">
      <p>Users</p>
      <circa-button
        class="add-user-btn tiny"
        faIcon="fas fa-plus"
        @click.native="state = 'isCreating'"
      >
        Add User
      </circa-button>
    </div>

    <div class="user-list" v-if="state === 'userList'">
      <div v-for="(user, index) in users" class="user-list-item" :class="{isEditing: user.isEditing}" :key="index">
        <div class="item-name">{{user.name}}</div>
        <div class="item-location">{{user.username}}</div>
        <div class="item-actions">
          <button class="action-wrapper edit-action" @click="user.isEditing = !user.isEditing">
            <i class="fas fa-pencil-alt"></i>
          </button>
          <button class="action-wrapper" @click="deleteUser(user)">
            <i class="fas fa-trash"></i>
          </button>
        </div>
        <div v-if="user.isEditing" class="edit-user-wrapper">
          <circa-input placeholder="Name*" :value="user.name" v-model="user.name"/>
          <circa-input placeholder="Username*" :value="user.username" v-model="user.username"/>
          <circa-input placeholder="Email*" :value="user.email" v-model="user.email"/>
          <p class="input-label">Reset Password</p>
          <circa-input type="password" placeholder="Password*" :value="user.password" v-model="user.password"/>
          <circa-input type="password" placeholder="Confirm Password*" :class="{doesntMatchPassword: !user.password.includes(user.confirmPassword)}" :value="user.confirmPassword" v-model="user.confirmPassword"/>
          <div class="btns-wrapper">
            <circa-button class="btn small" @click.native="user.isEditing = false">Cancel</circa-button>
            <circa-button class="btn dark small" @click.native="updateUser(user)">Update User</circa-button>
          </div>
        </div>
      </div>
    </div>

    <div class="add-user-wrapper" v-if="state === 'isCreating'">
      <circa-input placeholder="Username*" :value="newUser.username" v-model="newUser.username"/>
      <circa-input placeholder="Email*" :value="newUser.email" v-model="newUser.email"/>
      <circa-input placeholder="Name*" :value="newUser.name" v-model="newUser.name"/>
      <circa-input type="password" placeholder="Password*" :value="newUser.password" v-model="newUser.password"/>
      <circa-input type="password" placeholder="Confirm Password*" :class="{doesntMatchPassword: !newUser.password.includes(newUser.confirmPassword)}" :value="newUser.confirmPassword" v-model="newUser.confirmPassword"/>
      <circa-checkbox label="Is this user super admin?" :value="newUser.aclType" v-model="newUser.aclType"/>
      <div class="btns-wrapper">
        <circa-button class="btn small" @click.native="state = 'userList'">Cancel</circa-button>
        <circa-button class="btn dark small" @click.native="createUser">Create User</circa-button>
      </div>
    </div>

  </div>
</template>

<script>
import Api from '@/api'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'circa-user-list',

  data () {
    return {
      users: [],
      state: 'userList', // isEditing, isCreating, userList
      newUser: {
        username: '',
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        aclType: 0
      }
    }
  },

  computed: {
    ...mapState({
      baseUsers (state) {
        return state.users.all
      }
    })
  },

  methods: {
    ...mapActions({
      setAlert: 'alert/setAlert',
      getUsers: 'users/getAll'
    }),
    createUser () {
      Api.post({
        path: '/user/create',
        contentType: 'application/json',
        auth: true,
        data: {
          acl_type: this.newUser.aclType ? '1' : '0',
          name: this.newUser.name,
          email: this.newUser.email,
          username: this.newUser.username,
          password: this.newUser.password,
          re_password: this.newUser.confirmPassword
        }
      }).then(response => {
        if (response.data.code === 200) {
          this.getUsers()
          this.setAlert({
            message: 'You have created a new user successfully!',
            type: 'success'
          })
          this.state = 'userList'
          this.newUser.username = ''
          this.newUser.name = ''
          this.newUser.email = ''
          this.newUser.password = ''
          this.newUser.confirmPassword = ''
        } else {
          this.setAlert({
            message: 'Sorry there was an issue creating the user, please try again or contact an admin.',
            type: 'error'
          })
          this.state = 'userList'
          console.log('error when creating slideshow')
        }
      })
    },
    updateUser (user) {
      let data = {
        id: user.id,
        acl_type: user.acl_type,
        username: user.username,
        name: user.name,
        email: user.email
      }
      if (user.password) {
        data['password'] = user.password
        data['re_password'] = user.confirmPassword
      }
      Api.post({
        path: '/user/update',
        contentType: 'application/json',
        auth: true,
        data: data
      }).then(response => {
        if (response.data.code === 200) {
          this.getUsers()
          user.isEditing = false
          this.setAlert({
            message: 'You have updated a user successfully!',
            type: 'success'
          })
          this.state = 'userList'
        } else {
          this.setAlert({
            message: 'Sorry there was an issue updating the user, please try again or contact an admin.',
            type: 'error'
          })
          console.log('error when creating slideshow')
        }
      })
    },
    deleteUser (user) {
      Api.post({
        path: '/user/delete',
        contentType: 'application/json',
        auth: true,
        data: {
          id: user.id
        }
      }).then(response => {
        if (response.data.code === 200) {
          this.getUsers()
          this.setAlert({
            message: 'You have deleted a user successfully!',
            type: 'success'
          })
        } else {
          this.setAlert({
            message: 'Sorry there was an issue deleting the user, please try again or contact an admin.',
            type: 'error'
          })
          console.log('error when deleteing user')
        }
      })
    }
  },

  watch: {
    baseUsers: {
      handler () {
        this.users = this.baseUsers.map(user => {
          return {
            ...user,
            password: '',
            currentPassword: '',
            isEditing: false
          }
        })
      },
      immediate: true
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  @import "../assets/sass/abstracts/index";

  .user-list-wrapper {
    background: #fff;
    border: 1px solid #E1E1E1;
    border-radius: 5px;
  }

  .user-list-header {
    display: flex;
    align-items: center;
    padding: 15px 30px;
    border-bottom: 1px solid #E1E1E1;

    p {
      margin: 0;
      vertical-align: middle;
      font-size: 21px;
    }

    .add-user-btn {
      margin-left: auto;
    }
  }

  .user-list-item {
    display: flex;
    justify-content: space-between;
    padding: 15px 30px;
    border-bottom: 1px solid #E1E1E1;
    flex-wrap: wrap;

    &.isEditing {
      .edit-action {
        opacity: 0.4;
      }
    }

    .item-name,
    .item-location {
      width: 40%;
    }

    .action-wrapper {
      cursor: pointer;
      border-width: 0;
      color: #666;
    }
  }

  .edit-user-wrapper,
  .add-user-wrapper {
    min-width: 100%;
    padding: 10%;

    .input-label {
      font-size: 12px;
      margin-top: 20px;
      margin-bottom: -10px;
    }

    .doesntMatchPassword {
      &.hasValue {
        border: solid 2px #ffb8b8;
      }
    }

    .btns-wrapper {
      margin-top: 20px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-gap: 10px;
    }
  }
</style>
