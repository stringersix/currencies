<template>
  <button
    class="button"
    type="button"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<style lang="stylus" scoped>
.button
  width 100%
  min-height 46px
  display inline-flex
  align-items center
  justify-content center
  padding 0 18px
  border 0
  border-radius 8px
  background #2574a9
  color #fff
  cursor pointer
  font inherit
  font-weight 800
  transition background .16s ease, box-shadow .16s ease, transform .16s ease

  &:hover:not(:disabled)
    background #1d638f

  &:focus-visible
    box-shadow 0 0 0 3px rgba(37, 116, 169, .22)
    outline none

  &:active:not(:disabled)
    transform translateY(1px)

  &:disabled
    background #a9b7ca
    cursor not-allowed
</style>

<script>
export default {
  name: 'BaseButton',
  props: {
    disabled: {
      type: Boolean,
      default: false
    }
  }
}
</script>
