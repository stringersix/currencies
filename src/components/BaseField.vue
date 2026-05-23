<template>
  <label class="field">
    <span class="field__label">{{ label }}</span>
    <slot />
  </label>
</template>

<style lang="stylus" scoped>
.field
  min-width 0
  display grid
  gap 8px

.field__label
  min-width 0
  color #465a78
  font-size .9rem
  font-weight 700
  overflow-wrap anywhere
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
