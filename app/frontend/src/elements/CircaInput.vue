<template>
  <div class="circa-input-field" :class="{hasValue: value, hasIcon: icon, isValid: validation, isRequired: required}">
    <div class="iconWrapper">
      <i v-if="icon" :class="icon"></i>
    </div>
    <label class="label" :for="inputId">{{placeholder}}</label>
    <input
      :type="type"
      class="input"
      :id="inputId"
      :value="value"
      v-on="listeners">
  </div>
</template>

<script>
export default {
  name: 'circa-input',
  props: {
    placeholder: {
      type: String
    },
    value: {
      type: String
    },
    icon: {
      type: String
    },
    required: {
      type: Boolean
    },
    type: {
      type: String,
      default: 'text'
    }
  },
  computed: {
    listeners () {
      return {
        ...this.$listeners,
        input: event =>
          this.$emit('input', event.target.value)
      }
    },
    inputId () {
      return `input${Math.floor((Math.random() * 1000000) + 1)}`
    },
    validation () {
      if (this.required) return this.value !== '' && this.value !== undefined
      return true
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "@/assets/sass/abstracts/_variables.scss";
  .circa-input-field {
    width: 100%;

    border-radius: 5px;
    border-color: #e1e1e1;
    border-style: solid;
    border-width: 1px;

    position: relative;
    padding: 0 20px;
    height: 45px;
    margin-top: 12px;
    background: #fff;

    &.hasIcon {
      padding: 0 20px 0 40px;
    }
  }

  .iconWrapper {
    position: absolute;
    left: 2px;
    bottom: 2px;
    width: 38px;
    top: 0;
    display: flex;
    justify-content: center;
    align-items: center;

    .fas {
      color: #a6a6a6;
      font-size: 14px;
    }
  }

  .label {
    position: absolute;
    top: 12px;

    font-size: 14px;
    font-weight: 300;
    font-weight: 300;

    transition: all 300ms;

    .hasValue & {
      top: 7px;
      font-size: 12px;
    }
  }

  .input {
    line-height: 36px;
    width: 100%;
    outline: 0;
    border: 0;
    background: transparent;
    transition: all 300ms;

    .hasValue & {
      line-height: 20px;
      padding-top: 19px;
    }
  }
</style>
