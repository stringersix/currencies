<template>
  <input
    class="number-input"
    type="number"
    inputmode="decimal"
    :value="displayValue"
    :min="min"
    :step="step"
    :placeholder="placeholder"
    @input="handleInput"
  >
</template>

<style lang="stylus" scoped>
.number-input
  width 100%
  height 44px
  padding 0 12px
  border 1px solid #c8d4e5
  border-radius 8px
  background #fff
  color #162033
  font inherit
  transition border-color .16s ease, box-shadow .16s ease

  &:focus
    border-color #2574a9
    box-shadow 0 0 0 3px rgba(37, 116, 169, .16)
    outline none

  &::placeholder
    color #8797ad
</style>

<script>
export default {
  name: 'BaseNumberInput',
  props: {
    modelValue: {
      type: Number,
      default: null
    },
    min: {
      type: Number,
      default: 0
    },
    step: {
      type: Number,
      default: 1
    },
    precision: {
      type: Number,
      default: 2
    },
    placeholder: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  computed: {
    displayValue() {
      return this.modelValue ?? ''
    }
  },
  methods: {
    handleInput(event) {
      const rawValue = event.target.value

      if (rawValue === '') {
        this.$emit('update:modelValue', null)
        return
      }

      const nextValue = Number(rawValue)

      if (Number.isNaN(nextValue)) {
        return
      }

      const factor = 10 ** this.precision
      this.$emit('update:modelValue', Math.round(nextValue * factor) / factor)
    }
  }
}
</script>
