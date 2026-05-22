<template>
  <label class="field">
    <span class="field__label">{{ label }}</span>
    <slot />
  </label>
</template>

<style lang="stylus" scoped>
.field
  display grid
  gap 8px

.field__label
  color #465a78
  font-size .9rem
  font-weight 700
</style>

<script>
export default {
  name: 'BaseField',
  props: {
    label: {
      type: String,
      required: true
    }
  }
}
</script>
