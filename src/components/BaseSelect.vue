<template>
  <div ref="root" class="select" :class="{ 'select--disabled': disabled }">
    <button
      class="select__trigger"
      type="button"
      :disabled="disabled"
      :aria-expanded="isOpen ? 'true' : 'false'"
      aria-haspopup="listbox"
      :aria-controls="listboxId"
      @click="toggleMenu"
      @keydown.down.prevent="moveActive(1)"
      @keydown.up.prevent="moveActive(-1)"
      @keydown.enter.prevent="handleConfirm"
      @keydown.space.prevent="handleConfirm"
      @keydown.home.prevent="setActiveIndex(0)"
      @keydown.end.prevent="setActiveIndex(options.length - 1)"
    >
      <span class="select__coin" aria-hidden="true">{{ selectedCode }}</span>
      <span class="select__value">
        <strong>{{ selectedCode }}</strong>
        <span>{{ selectedName }}</span>
      </span>
      <span class="select__arrow" aria-hidden="true" />
    </button>

    <div
      v-if="isOpen"
      :id="listboxId"
      class="select__menu"
      role="listbox"
      :aria-activedescendant="activeOptionId"
      tabindex="-1"
    >
      <div class="select__options">
      <button
        v-for="(option, index) in options"
        :id="getOptionId(index)"
        :key="option.value"
        ref="optionButtons"
        class="select__option"
        :class="{
          'select__option--active': index === activeIndex,
          'select__option--selected': option.value === modelValue
        }"
        type="button"
        role="option"
        :aria-selected="option.value === modelValue ? 'true' : 'false'"
        @click="selectOption(option.value)"
        @mouseenter="activeIndex = index"
      >
        <span class="select__option-code">{{ getOptionCode(option) }}</span>
        <span class="select__option-label">{{ getOptionName(option) }}</span>
        <span
          v-if="option.value === modelValue"
          class="select__check"
          aria-hidden="true"
        />
      </button>
      </div>
    </div>
  </div>
</template>

<style lang="stylus" scoped>
.select
  width 100%
  position relative

.select__trigger
  width 100%
  min-height 46px
  display grid
  grid-template-columns minmax(30px, 32px) minmax(0, 1fr) 18px
  align-items center
  gap 10px
  padding 7px 12px 7px 10px
  border 1px solid #c8d4e5
  border-radius 8px
  background linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)
  color #162033
  cursor pointer
  font inherit
  text-align left
  transition border-color .16s ease, box-shadow .16s ease, background .16s ease

  &:hover:not(:disabled)
    border-color #9db2cb
    background #fff

  &:focus-visible,
  &[aria-expanded='true']
    border-color #2574a9
    box-shadow 0 0 0 3px rgba(37, 116, 169, .16)
    outline none

  &:disabled
    color #8797ad
    cursor not-allowed

.select__coin
  width 100%
  min-width 30px
  height 32px
  display inline-flex
  align-items center
  justify-content center
  border 1px solid #c7deec
  border-radius 8px
  background #eaf4fa
  color #2574a9
  font-size .68rem
  font-weight 900

.select__value
  min-width 0
  display grid
  gap 1px

  strong,
  span
    min-width 0
    overflow hidden
    text-overflow ellipsis
    white-space nowrap

  strong
    color #162033
    font-size .9rem
    font-weight 900

  span
    color #5b6f91
    font-size .78rem
    font-weight 700

.select__arrow
  width 10px
  height 10px
  justify-self center
  border-right 2px solid #5b6f91
  border-bottom 2px solid #5b6f91
  transform translateY(-2px) rotate(45deg)
  transition transform .16s ease

.select__trigger[aria-expanded='true'] .select__arrow
  transform translateY(2px) rotate(225deg)

.select__menu
  width 100%
  min-width min(100%, 240px)
  max-width calc(100vw - 24px)
  position absolute
  z-index 30
  top calc(100% + 10px)
  left 0
  overflow visible
  padding 8px
  border 1px solid #c8d4e5
  border-radius 8px
  background #fff
  box-shadow 0 18px 45px rgba(41, 57, 87, .18)

  &::before
    content ''
    width 14px
    height 14px
    position absolute
    top -8px
    left 22px
    border-top 1px solid #c8d4e5
    border-left 1px solid #c8d4e5
    background #fff
    transform rotate(45deg)

.select__options
  max-height 284px
  display grid
  gap 4px
  overflow-x hidden
  overflow-y auto

.select__option
  min-height 44px
  display grid
  grid-template-columns minmax(42px, 54px) minmax(0, 1fr) 16px
  align-items center
  gap 10px
  padding 7px 10px
  border 1px solid transparent
  border-radius 8px
  background transparent
  color #162033
  cursor pointer
  font inherit
  text-align left
  transition background .14s ease, border-color .14s ease, color .14s ease

  &:focus-visible
    box-shadow 0 0 0 3px rgba(37, 116, 169, .16)
    outline none

.select__option--active
  border-color #c7deec
  background #eef6fb

.select__option--selected
  border-color #1f6f9f
  background #2574a9
  color #fff

  .select__option-code,
  .select__option-label
    color #fff

.select__option-code
  color #2574a9
  font-size .76rem
  font-weight 900

.select__option-label
  min-width 0
  overflow hidden
  color #2d4565
  font-size .86rem
  font-weight 700
  text-overflow ellipsis
  white-space nowrap

.select__check
  width 10px
  height 16px
  justify-self center
  border-right 2px solid currentColor
  border-bottom 2px solid currentColor
  transform rotate(45deg)

@media (max-width: 520px)
  .select__trigger
    grid-template-columns 30px minmax(0, 1fr) 16px
    gap 8px
    min-height 48px
    padding 7px 10px

  .select__coin
    height 30px
    font-size .64rem

  .select__menu
    max-width calc(100vw - 24px)
    top calc(100% + 8px)

  .select__options
    max-height calc(100dvh - 180px)

  .select__option
    grid-template-columns 42px minmax(0, 1fr) 16px
    gap 8px
    min-height 48px
    padding 8px
</style>

<script>
function splitLabel(option) {
  const label = option?.label || ''
  const separator = label.indexOf(' - ')

  if (separator === -1) {
    return {
      code: option?.value || label || '---',
      name: label || 'Choose currency'
    }
  }

  return {
    code: label.slice(0, separator),
    name: label.slice(separator + 3)
  }
}

export default {
  name: 'BaseSelect',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    options: {
      type: Array,
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      isOpen: false,
      activeIndex: 0,
      listboxId: 'select-' + Math.random().toString(36).slice(2)
    }
  },
  computed: {
    selectedOption() {
      return this.options.find(option => option.value === this.modelValue) || this.options[0] || null
    },
    selectedParts() {
      return splitLabel(this.selectedOption)
    },
    selectedCode() {
      return this.selectedParts.code
    },
    selectedName() {
      return this.selectedParts.name
    },
    activeOptionId() {
      return this.getOptionId(this.activeIndex)
    }
  },
  watch: {
    modelValue() {
      this.syncActiveIndex()
    },
    options() {
      this.syncActiveIndex()
    },
    disabled(value) {
      if (value) {
        this.closeMenu()
      }
    }
  },
  mounted() {
    this.syncActiveIndex()
    document.addEventListener('click', this.handleDocumentClick)
    document.addEventListener('keydown', this.handleDocumentKeydown)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleDocumentClick)
    document.removeEventListener('keydown', this.handleDocumentKeydown)
  },
  methods: {
    openMenu() {
      if (this.disabled || !this.options.length) {
        return
      }

      this.isOpen = true
      this.syncActiveIndex()
      this.scrollActiveOptionIntoView()
    },
    closeMenu() {
      this.isOpen = false
    },
    toggleMenu() {
      if (this.isOpen) {
        this.closeMenu()
        return
      }

      this.openMenu()
    },
    handleConfirm() {
      if (!this.isOpen) {
        this.openMenu()
        return
      }

      const option = this.options[this.activeIndex]

      if (option) {
        this.selectOption(option.value)
      }
    },
    moveActive(offset) {
      if (!this.isOpen) {
        this.openMenu()
        return
      }

      this.setActiveIndex(this.activeIndex + offset)
    },
    setActiveIndex(index) {
      if (!this.options.length) {
        this.activeIndex = 0
        return
      }

      const lastIndex = this.options.length - 1
      this.activeIndex = Math.min(Math.max(index, 0), lastIndex)
      this.scrollActiveOptionIntoView()
    },
    selectOption(value) {
      this.$emit('update:modelValue', value)
      this.closeMenu()
    },
    syncActiveIndex() {
      const selectedIndex = this.options.findIndex(option => option.value === this.modelValue)
      this.activeIndex = selectedIndex === -1 ? 0 : selectedIndex
    },
    scrollActiveOptionIntoView() {
      this.$nextTick(() => {
        const optionButton = this.$refs.optionButtons?.[this.activeIndex]

        if (optionButton) {
          optionButton.scrollIntoView({ block: 'nearest' })
        }
      })
    },
    getOptionId(index) {
      return this.listboxId + '-option-' + index
    },
    getOptionCode(option) {
      return splitLabel(option).code
    },
    getOptionName(option) {
      return splitLabel(option).name
    },
    handleDocumentClick(event) {
      if (!this.isOpen || this.$refs.root?.contains(event.target)) {
        return
      }

      this.closeMenu()
    },
    handleDocumentKeydown(event) {
      if (event.key === 'Escape') {
        this.closeMenu()
      }
    }
  }
}
</script>
