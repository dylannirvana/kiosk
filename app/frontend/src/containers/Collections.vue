<script>
import { mapState } from 'vuex'
import CircaButton from '@/elements/CircaButton'
import CircaBreadCrumbs from '@/elements/CircaBreadCrumbs'
import CircaCategoryCard from '@/components/CircaCategoryCard'
import CircaCategoryCardPlaceholder from '@/components/CircaCategoryCardPlaceholder'

export default {
  name: 'Collections',
  components: {
    CircaButton,
    CircaBreadCrumbs,
    CircaCategoryCard,
    CircaCategoryCardPlaceholder
  },

  data () {
    return {
      placeholders: ['ceiling', 'wall', 'table', 'floor', 'outdoor', 'fans']
    }
  },

  computed: {
    ...mapState({
      categories (state) {
        let categories = Object.entries(state.categories.formatted).map(category => category[1])
        categories = categories.filter(category => !category.hidden)
        return categories.length > 0 ? categories : []
      },
      dataHasLoaded (state) {
        return state.categories.loaded
      }
    })
  }
}
</script>

<template>
  <div class="collections-wrapper">
    <div class="collections" v-if="dataHasLoaded">
      <circa-category-card
        v-for="(category, index) in categories"
        v-if="placeholders.includes(category.handle)"
        :category="category"
        :key="index" />
    </div>
    <div v-else class="collections">
      <circa-category-card-placeholder
        v-for="(title, index) in placeholders"
        :title="title"
        :key="index" />
    </div>
    <router-link class="admin-btn" to="/admin">
      Admin
    </router-link>
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  @import "../assets/sass/abstracts/index";

  .collections {
    padding: $container-padding;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 1% 2%;
  }

  .admin-btn {
    background-color: #BEBEBE;
    border-radius: 0 3px 0 0;
    padding: 5px 10px 0;

    color: #fff;
    font-size: 14px;
    text-decoration: none;

    position: fixed;
    bottom: 0;
    left: 0;
    z-index: 999;
  }
</style>
