<script>
import { mapState } from 'vuex'

export default {
  name: 'circa-search',

  data () {
    return {
      state: 'isClosed', // isClosed, isClosing, isOpening, isOpen
      animationTime: 600, // If changing, remember to change inside styles below as well
      isActive: false,
      searchTerm: ''
    }
  },

  computed: {
    ...mapState({
      products (state) {
        return state.products.products
      }
    })
  },

  beforeMount () {
    window.addEventListener('click', this.handleScreenClick)
  },

  beforeDestroy () {
    window.removeEventListener('click', this.handleScreenClick)
  },

  methods: {
    handleScreenClick (e) {
      let pathClasses = ''
      e.path.map(item => {
        if (item.classList) {
          pathClasses += item.classList.value
        }
      })
      if (!pathClasses.includes('search') && this.state === 'isOpen') {
        this.closeSearch()
      }
    },
    handleSearchClick () {
      switch (this.state) {
        case 'isClosed':
          this.state = 'isOpening'
          setTimeout(() => { this.state = 'isOpen' }, this.animationTime)
          this.$refs.searchInput.focus()
          break
        case 'isOpen':
          if (this.searchTerm !== '') {
            this.submitSearch()
          }
          break
      }
    },
    submitSearch () {
      localStorage.setItem('prevViewedCollectionPath', this.$route.path)
      this.closeSearch()
      this.$router.push({name: 'Search', params: {query: this.searchTerm}})
    },
    handleInputKeypress (e) {
      if (e.keyCode === 13 && this.searchTerm !== '') {
        this.submitSearch()
      }
    },
    closeSearch () {
      this.state = 'isClosing'
      setTimeout(() => { this.state = 'isClosed' }, this.animationTime)
      this.$refs.searchInput.blur()
    }
  },

  watch: {
    state () {
      switch (this.state) {
        case 'isClosed':
          this.isActive = false
          this.searchTerm = ''
          break
        case 'isOpening':
          this.isActive = true
          break
        case 'isOpen':
          this.isActive = true
          break
      }
    }
  }
}
</script>

<template>
  <div class="search-wrapper" :class="[state, {isActive: isActive}]">
    <div class="search">
      <div class="input-wrapper">
        <div class="search-icon-wrapper" @click="handleSearchClick">
          <svg width="22" height="23" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(1 1)" fill-rule="nonzero" stroke="#BEBEBE" stroke-width="2" fill="none">
              <circle cx="7.636" cy="7.636" r="7.636"/>
              <path d="M12.886 13.84l6.682 6.683" stroke-linecap="round"/>
            </g>
          </svg>
        </div>
        <input class="search-input" type="text" placeholder="Search by SKU/Product Name" @keypress="handleInputKeypress" @focus="handleSearchClick" v-model="searchTerm" ref="searchInput">
        <div class="close-icon-wrapper" @click="closeSearch">
          <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 1.812L10.812 9 18 16.188 16.188 18 9 10.812 1.812 18 0 16.188 7.188 9 0 1.812 1.812 0 9 7.188 16.188 0z" fill="#666" fill-rule="evenodd"/>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  $animation-time: 600ms;
  .search-wrapper {
    position: relative;
    display: block;
    height: 50px;
    width: 24px;
  }

  .search {
    width: 40px;
    transition: width $animation-time;

    .isOpening &,
    .isOpen & {
      position: absolute;
      top: 0;
      right: 0;
      width: 600px;
    }

    .isClosing & {
      position: absolute;
      top: 0;
      right: 0;
      width: 44px;
    }
  }

  .search-icon-wrapper {
    position: relative;
    display: inline-block;
    padding: 8.5px 0;
    z-index: 10;
    cursor: pointer;

    .isOpen &,
    .isOpening & {
      z-index: 12;
    }

    svg {
      margin-top: 5px;

      .isOpening &,
      .isOpen &,
      .isClosing & {
        margin-left: 30px;
      }
    }
  }

  .close-icon-wrapper {
    position: relative;
    padding: 5px 10px;
    z-index: 10;
    top: 6px;
    right: 6px;
    cursor: pointer;
    display: none;
    float: right;

    .isOpen &,
    .isOpening & {
      z-index: 12;
    }

    .isOpen & {
      display: inline-block;
    }

    svg {
      margin-top: 5px;
    }
  }

  .fa {
    color: #BEBEBE;
  }

  .search-input {
    border-radius: 5px;
    border-color: #BEBEBE;
    border-style: solid;
    border-width: 1px;
    display: inline-block;
    line-height: 48px;
    font-size: 19px;
    font-weight: 300;
    opacity: 0;
    padding: 0;
    position: absolute;
    right: 0;
    top: 0;
    width: 200%;
    transition: width $animation-time, border $animation-time;
    outline: none;
    z-index: 11;

    &::placeholder {
      color: #BEBEBE;
    }

    .isActive & {
      opacity: 1;
      width: 100%;
      padding: 0 20px 0 68px;
    }

    .isClosing &,
    .isClosed & {
      border-color: rgba(0,0,0,0);
      cursor: pointer;
    }
  }
</style>
