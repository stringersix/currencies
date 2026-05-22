<template>
  <div
    class="alert"
    :class="`alert--${type}`"
    role="status"
  >
    <span class="alert__icon" aria-hidden="true">{{ icon }}</span>
    <span>{{ title }}</span>
  </div>
</template>

<style lang="stylus" scoped>
.alert
  display flex
  align-items center
  gap 10px
  padding 12px 14px
  border 1px solid
  border-radius 8px
  font-size .95rem
  font-weight 700

.alert__icon
  width 20px
  height 20px
  display inline-flex
  align-items center
  justify-content center
  border-radius 50%
  color #fff
  font-size .78rem

.alert--error
  border-color #e7b8bd
  background #fff4f5
  color #8f2632

  .alert__icon
    background #c63f4f

.alert--success
  border-color #a8d8c5
  background #f0fbf6
  color #176342

  .alert__icon
    background #248961
</style>

<script>
export default {
  name: 'BaseAlert',
  props: {
    type: {
      type: String,
      default: 'success',
      validator: value => ['success', 'error'].includes(value)
    },
    title: {
      type: String,
      required: true
    }
  },
  computed: {
    icon() {
      return this.type === 'error' ? '!' : 'i'
    }
  }
}
</script>
