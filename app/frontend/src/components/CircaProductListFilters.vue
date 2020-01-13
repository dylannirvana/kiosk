<script>
import { mapState, mapActions } from 'vuex'
export default {
  name: 'circa-product-list-filters',

  data () {
    return {
      activeFilter: {},
      activeSort: '',
      sortIsOpen: false,
      sortOptions: [
        {
          label: 'Price: Low to High',
          value: 'price-asc'
        },
        {
          label: 'Price: High to Low',
          value: 'price-des'
        }
      ]
    }
  },

  computed: {
    ...mapState({
      filterList (state) {
        return state.productListFilters.dynamicFilterList
      },
      activeFilters (state) {
        return state.productListFilters.activeFilters
      }
    }),
    localActiveFilters: {
      get (state) {
        return this.activeFilters
      },
      set (newValue) {
        this.setActiveFilters(newValue)
      }
    },
    optionHasNoSelectedItems () {
      let selectedQtyObj = {}
      this.filterList.map(filter => {
        selectedQtyObj[filter.optionKey] = !this.localActiveFilters.map(option => option.includes(filter.optionKey + ':')).includes(true)
      })
      return selectedQtyObj
    }
  },

  beforeMount () {
    window.addEventListener('click', this.handleScreenClick)
  },

  beforeDestroy () {
    window.removeEventListener('click', this.handleScreenClick)
  },

  methods: {
    ...mapActions({
      setActiveFilters: 'productListFilters/setActiveFilters',
      setActiveSort: 'productListFilters/setActiveSort'
    }),
    handleScreenClick (e) {
      let pathClasses = ''
      e.path.map(item => {
        if (item.classList) {
          pathClasses += item.classList.value
        }
      })
      if (!pathClasses.includes('item-options') && !pathClasses.includes('filter-item') && this.activeFilter.label) {
        this.activeFilter = {}
      }
    },
    setViewAll (optionKey) {
      this.localActiveFilters = this.localActiveFilters.filter(option => !option.includes(optionKey))
    },
    toggleActive (option) {
      if (this.activeFilter.label === option.label) {
        this.activeFilter = {}
        return
      }
      this.activeFilter = option
    },
    clearAllFilters () {
      this.localActiveFilters = []
    },
    removeActiveOption (option) {
      const activeFilters = this.localActiveFilters
      this.activeFilters.splice(option, 1)
      this.localActiveFilters = activeFilters
    }
  },

  watch: {
    $route (to, from) {
      // Clear data if not navigating within same category/sub-category dont clear
      if (to && from && (from.fullPath.includes(to.fullPath) || to.fullPath.includes(from.fullPath))) return
      this.localActiveFilters = []
      this.activeSort = ''
      this.setActiveSort(this.activeSort)
    },
    activeSort () {
      this.setActiveSort(this.activeSort)
    }
  }
}
</script>

<template>
  <div class="product-list-filters-wrapper">
    <div class="product-list-filters">
      <div class="filter-items-wrapper">
        <ul class="filter-items">
          <li
            v-for="(option, index) in filterList"
            class="filter-item"
            :class="{isActive: activeFilter.label === option.label}"
            :key="index"
          >
            <h4 class="item-label" @click="toggleActive(option)">
              <span>
                {{option.label}}
              </span>
              <i class="fas fa-sort-down"></i>
            </h4>

            <transition name="fade-in">
              <div v-if="activeFilter.label === option.label" class="item-options">
                <ul>
                  <li class="isActive">
                    <label>
                      <input
                        type="checkbox"
                        name="filterOptions"
                        @change="setViewAll(option.optionKey)"
                        v-model="optionHasNoSelectedItems[option.optionKey]"
                      >
                      <span class="child-option">View All</span>
                    </label>
                  </li>
                  <li v-for="(childOption, childIndex) in option.options" :class="{isActive: childOption.isActive}" :key="childIndex">
                    <label>
                      <input
                        v-model="localActiveFilters"
                        name="filterOptions"
                        type="checkbox"
                        :value="option.optionKey + ':' + childOption.label"
                        :disabled="!childOption.isActive"
                      >
                      <span class="child-option">{{childOption.label}}</span>
                    </label>
                  </li>
                </ul>
              </div>
            </transition>
          </li>
        </ul>
      </div>

      <div class="sort-options-wrapper">
        <div class="sort-options">

          <h4 class="item-label" @click="sortIsOpen = !sortIsOpen">
            <span>
              Sort By
            </span>
            <i class="fas fa-sort-down"></i>
          </h4>

          <transition name="fade-in">
            <div v-if="sortIsOpen" class="item-options">
              <ul>
                <li v-for="(option, index) in sortOptions" class="isActive" :key="index">
                  <label>
                    <input
                      name="sortOptions"
                      type="radio"
                      v-model="activeSort"
                      :value="option.value"
                    >
                    <span class="child-option">{{option.label}}</span>
                  </label>
                </li>
              </ul>
            </div>
          </transition>

        </div>
      </div>
    </div>
    <div class="active-filters-wrapper" v-if="this.localActiveFilters.length > 0">
      <button class="clear-active-filters" @click="clearAllFilters">
        <i class="ion-close"></i>  Clear All
      </button>
      <ul class="active-filters">
        <li class="active-filter-item" v-for="(option, index) in localActiveFilters" @click="removeActiveOption(option)" :key="index">
          <i class="ion-close"></i> {{option.split(':')[1]}}
        </li>
      </ul>
    </div>
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  @import "../assets/sass/abstracts/index";
  .product-list-filters-wrapper {
    padding: $container-padding;
    margin-bottom: 2.5%;
  }

  .active-filters-wrapper {
    border-bottom: 1px solid #E1E1E1;
    display: flex;
  }
  .clear-active-filters {
    background-color: rgba(0,0,0,0);
    border-width: 0;
    border-right: 1px solid #E1E1E1;
    display: inline-block;
    font-size: 12px;
    font-weight: 300;
    letter-spacing: 2px;
    line-height: 68px;
    min-width: 130px;
    padding-right: 20px;
    text-transform: uppercase;
    cursor: pointer;
  }
  .active-filters {
    display: inline-block;
    list-style: none;
    margin: 0;
    padding: 0;
    width: 100%;
  }
  .active-filter-item {
    display: inline-block;
    font-size: 12px;
    font-weight: 300;
    line-height: 68px;
    padding-left: 20px;
    cursor: pointer;

    i {
      margin-right: 5px;
    }
  }

  .product-list-filters {
    display: flex;
    justify-content: space-between;
    border-top: 1px solid #E1E1E1;
    border-bottom: 1px solid #E1E1E1;
  }

  .filter-items-wrapper {
    width: 100%;
    max-width: 83.333%
  }
  .sort-options-wrapper {
    width: 100%;
    max-width: 16.666%;
    border-left: 1px solid #E1E1E1;
  }

  .sort-options {
    position: relative;
    padding-left: 20px;
  }

  .filter-items {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .filter-item {
    display: inline-block;
    position: relative;
  }

  .item-label {
    line-height: 68px;
    text-transform: uppercase;
    font-family: "Bookman Old Style";
    margin: 0 20px 0 0;
    cursor: pointer;

    @media (max-width: 1060px) {
      margin: 0 18px 0 0;
    }

    .isActive & {
      border-bottom: solid 4px #333;
      line-height: 60px;
    }

    .sort-options & {
      margin: 0;
    }

    span,
    i {
      vertical-align: middle;
      margin-bottom: 8px;
      margin-left: 10px;
    }

    i {
      .isActive & {
        transform: rotate(180deg);
        margin-bottom: -8px;
      }
    }
  }
  .item-options {
    background: #fff;
    border: 1px solid #E1E1E1;
    min-width: 200px;
    max-height: 360px;
    overflow: scroll;
    padding: 20px;

    position: absolute;
    left: 0;
    z-index: 999;

    &::-webkit-scrollbar {
        -webkit-appearance: none;
        width: 10px;
    }
    &::-webkit-scrollbar-thumb {
        border-radius: 10px;
        background-color: #E1E1E1;
        -webkit-box-shadow: 0 0 1px rgba(255,255,255,.5);
    }

    .sort-options & {
      left: auto;
      right: 0;
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    li {
      padding: 15px 0;
      opacity: 0.4;

      &.isActive {
        opacity: 1;
      }
    }

    label {
      display: block;
    }

    input {
      display: none;
    }
  }

  .child-option {
    display: block;
    position: relative;
    padding-left: 30px;
    cursor: pointer;

    &:before,
    &:after {
      content: "";
      position: absolute;
    }
    &:before {
      left: 0;
      top: 3px;
      width: 12px;
      height: 12px;
      border: solid 1px #333;
    }
    &:after {
      left: 2px;
      top: 5px;
      width: 10px;
      height: 10px;
      background: #fff;

      input:checked ~ & {
        background: #333;
      }
    }
  }

  // Animations
  .fade-in-enter-active,
  .fade-in-leave-active {
    transition: all 400ms ease;
    opacity: 1;
    max-height: 360px;
    transform-origin: 0 0;
    transform: scale(1);
  }
  .fade-in-leave-to, .fade-in-enter {
    opacity: 0;
    max-height: 0;
    transform: scale(0.6);
  }
</style>
