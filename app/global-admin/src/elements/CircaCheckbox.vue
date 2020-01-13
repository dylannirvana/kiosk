<template>
  <div class="circa-checkbox-field" :class="{isChecked: isChecked}">
    <label>
      <input
        type="checkbox"
        class="input"
        :id="inputId"
        :value="value"
        v-model="isChecked">
      <span>{{label}}</span>
    </label>
  </div>
</template>

<script>
export default {
  name: 'circa-checkbox',
  props: {
    label: {
      type: String
    },
    value: {
      type: String
    }
  },
  data () {
    return {
      isChecked: 0
    }
  },
  computed: {
    inputId () {
      return `input${Math.floor((Math.random() * 1000000) + 1)}`
    }
  },
  watch: {
    isChecked () {
      this.$emit('input', this.isChecked)
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "@/assets/sass/abstracts/_variables.scss";
  .circa-checkbox-field {
    position: relative;
    padding: 15px 0;
  }

  label {
    &:before {
      content: "";
      position: absolute;
      width: 14px;
      height: 14px;
      margin-top: 1px;
      border-radius: 3px;
      border-color: #d8d8d8;
      border-style: solid;
      border-width: 1px;
    }
    &:after {
      content: "";
      position: absolute;
      width: 8px;
      height: 8px;
      margin-top: 5px;
      left: 4px;
      border-radius: 1px;

      .isChecked & {
        background: #4795ff;
      }
    }
  }
  .input {
    opacity: 0;
    margin-right: 5px;
  }
</style>
