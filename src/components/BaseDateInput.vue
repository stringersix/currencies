<template>
  <div ref="root" class="date-picker">
    <button
      class="date-picker__trigger"
      type="button"
      :aria-expanded="isOpen ? 'true' : 'false'"
      aria-haspopup="dialog"
      @click="toggleCalendar"
      @keydown.down.prevent="openCalendar"
      @keydown.enter.prevent="toggleCalendar"
      @keydown.space.prevent="toggleCalendar"
    >
      <span class="date-picker__icon" aria-hidden="true">
        <span class="date-picker__rings" />
        <span class="date-picker__grid" />
      </span>
      <span class="date-picker__value" :class="{ 'date-picker__value--empty': !modelValue }">
        {{ displayValue }}
      </span>
    </button>

    <div
      v-if="isOpen"
      class="calendar"
      role="dialog"
      aria-label="Choose date"
      @keydown.esc="closeCalendar"
    >
      <div class="calendar__header">
        <button
          class="calendar__nav"
          type="button"
          aria-label="Previous month"
          @click="changeMonth(-1)"
        >
          <span aria-hidden="true">&lt;</span>
        </button>

        <strong class="calendar__title">{{ monthTitle }}</strong>

        <button
          class="calendar__nav"
          type="button"
          aria-label="Next month"
          @click="changeMonth(1)"
        >
          <span aria-hidden="true">&gt;</span>
        </button>
      </div>

      <div class="calendar__weekdays" aria-hidden="true">
        <span v-for="dayName in weekdayNames" :key="dayName">{{ dayName }}</span>
      </div>

      <div class="calendar__grid">
        <button
          v-for="day in calendarDays"
          :key="day.iso"
          class="calendar__day"
          :class="{
            'calendar__day--muted': !day.inCurrentMonth,
            'calendar__day--selected': day.iso === modelValue,
            'calendar__day--today': day.iso === todayIso
          }"
          type="button"
          @click="selectDate(day.iso)"
        >
          <span>{{ day.label }}</span>
        </button>
      </div>

      <div class="calendar__footer">
        <button class="calendar__text-button" type="button" @click="clearDate">Clear</button>
        <button class="calendar__text-button" type="button" @click="selectToday">Today</button>
      </div>
    </div>
  </div>
</template>

<style lang="stylus" scoped>
.date-picker
  width 100%
  position relative

.date-picker__trigger
  width 100%
  height 46px
  display grid
  grid-template-columns 36px 1fr
  align-items center
  gap 10px
  padding 0 12px 0 10px
  border 1px solid #c8d4e5
  border-radius 8px
  background linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)
  color #162033
  cursor pointer
  font inherit
  text-align left
  transition border-color .16s ease, box-shadow .16s ease, background .16s ease

  &:hover
    border-color #9db2cb
    background #fff

  &:focus-visible,
  &[aria-expanded='true']
    border-color #2574a9
    box-shadow 0 0 0 3px rgba(37, 116, 169, .16)
    outline none

.date-picker__icon
  width 30px
  height 30px
  display grid
  place-items center
  position relative
  border 1px solid #c7deec
  border-radius 8px
  background #eaf4fa

  &::before
    content ''
    width 16px
    height 15px
    display block
    border 2px solid #2574a9
    border-top-width 5px
    border-radius 4px
    background #fff

.date-picker__rings
  position absolute
  top 7px
  left 9px
  width 12px
  height 4px
  border-left 2px solid #2574a9
  border-right 2px solid #2574a9

.date-picker__grid
  position absolute
  bottom 8px
  width 10px
  height 5px
  background repeating-linear-gradient(90deg, #9db2cb 0 2px, transparent 2px 4px)

.date-picker__value
  min-width 0
  overflow hidden
  color #162033
  font-weight 800
  text-overflow ellipsis
  white-space nowrap

.date-picker__value--empty
  color #8797ad
  font-weight 600

.calendar
  width 320px
  max-width calc(100vw - 32px)
  position absolute
  z-index 20
  top calc(100% + 10px)
  left 0
  padding 14px
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

.calendar__header
  display grid
  grid-template-columns 34px 1fr 34px
  align-items center
  gap 8px
  margin-bottom 12px

.calendar__title
  color #162033
  font-size .98rem
  text-align center

.calendar__nav
  width 34px
  height 34px
  display inline-flex
  align-items center
  justify-content center
  border 1px solid #d7e0ed
  border-radius 8px
  background #f7fafc
  color #2d4565
  cursor pointer
  font inherit
  font-size 1rem
  font-weight 800
  transition background .16s ease, border-color .16s ease, color .16s ease

  &:hover
    border-color #9db2cb
    background #eef6fb
    color #2574a9

  &:focus-visible
    box-shadow 0 0 0 3px rgba(37, 116, 169, .16)
    outline none

.calendar__weekdays
  display grid
  grid-template-columns repeat(7, 1fr)
  gap 4px
  margin-bottom 6px
  color #5b6f91
  font-size .72rem
  font-weight 800
  text-align center
  text-transform uppercase

.calendar__grid
  display grid
  grid-template-columns repeat(7, 1fr)
  gap 4px

.calendar__day
  aspect-ratio 1
  display inline-flex
  align-items center
  justify-content center
  border 1px solid transparent
  border-radius 8px
  background transparent
  color #162033
  cursor pointer
  font inherit
  font-size .88rem
  font-weight 700
  transition background .14s ease, border-color .14s ease, color .14s ease, transform .14s ease

  &:hover
    border-color #c7deec
    background #eef6fb
    color #2574a9

  &:focus-visible
    box-shadow 0 0 0 3px rgba(37, 116, 169, .16)
    outline none

.calendar__day--muted
  color #94a3b8
  font-weight 600

.calendar__day--today
  border-color #94c5df
  background #f3f9fc

.calendar__day--selected
  border-color #1f6f9f
  background #2574a9
  color #fff
  box-shadow 0 8px 16px rgba(37, 116, 169, .22)

  &:hover
    background #1d638f
    color #fff

.calendar__footer
  display flex
  justify-content space-between
  gap 12px
  margin-top 14px
  padding-top 12px
  border-top 1px solid #e6edf6

.calendar__text-button
  border 0
  background transparent
  color #2574a9
  cursor pointer
  font inherit
  font-size .88rem
  font-weight 800

  &:hover
    color #1d638f
    text-decoration underline

  &:focus-visible
    border-radius 6px
    box-shadow 0 0 0 3px rgba(37, 116, 169, .16)
    outline none

@media (max-width: 520px)
  .calendar
    right 0
    left auto

    &::before
      right 22px
      left auto
</style>

<script>
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]
const WEEKDAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function pad(value) {
  return String(value).padStart(2, '0')
}

function toIsoDate(date) {
  return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate())
}

function parseIsoDate(value) {
  if (!value) {
    return null
  }

  const parts = value.split('-').map(Number)

  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return null
  }

  return new Date(parts[0], parts[1] - 1, parts[2])
}

function addDays(date, days) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

export default {
  name: 'BaseDateInput',
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  data() {
    const selectedDate = parseIsoDate(this.modelValue) || new Date()

    return {
      isOpen: false,
      visibleYear: selectedDate.getFullYear(),
      visibleMonth: selectedDate.getMonth(),
      weekdayNames: WEEKDAY_NAMES,
      todayIso: toIsoDate(new Date())
    }
  },
  computed: {
    displayValue() {
      const date = parseIsoDate(this.modelValue)

      if (!date) {
        return 'Select date'
      }

      return MONTH_NAMES[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear()
    },
    monthTitle() {
      return MONTH_NAMES[this.visibleMonth] + ' ' + this.visibleYear
    },
    calendarDays() {
      const firstDay = new Date(this.visibleYear, this.visibleMonth, 1)
      const firstWeekday = (firstDay.getDay() + 6) % 7
      const startDate = addDays(firstDay, -firstWeekday)
      const days = []

      for (let index = 0; index < 42; index += 1) {
        const date = addDays(startDate, index)

        days.push({
          iso: toIsoDate(date),
          label: date.getDate(),
          inCurrentMonth: date.getMonth() === this.visibleMonth
        })
      }

      return days
    }
  },
  watch: {
    modelValue(value) {
      const date = parseIsoDate(value)

      if (!date) {
        return
      }

      this.visibleYear = date.getFullYear()
      this.visibleMonth = date.getMonth()
    }
  },
  mounted() {
    document.addEventListener('click', this.handleDocumentClick)
    document.addEventListener('keydown', this.handleDocumentKeydown)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleDocumentClick)
    document.removeEventListener('keydown', this.handleDocumentKeydown)
  },
  methods: {
    openCalendar() {
      this.isOpen = true
    },
    closeCalendar() {
      this.isOpen = false
    },
    toggleCalendar() {
      this.isOpen = !this.isOpen
    },
    changeMonth(offset) {
      const nextMonth = new Date(this.visibleYear, this.visibleMonth + offset, 1)
      this.visibleYear = nextMonth.getFullYear()
      this.visibleMonth = nextMonth.getMonth()
    },
    selectDate(value) {
      this.$emit('update:modelValue', value)
      this.closeCalendar()
    },
    selectToday() {
      this.selectDate(toIsoDate(new Date()))
    },
    clearDate() {
      this.$emit('update:modelValue', '')
      this.closeCalendar()
    },
    handleDocumentClick(event) {
      if (!this.isOpen || this.$refs.root?.contains(event.target)) {
        return
      }

      this.closeCalendar()
    },
    handleDocumentKeydown(event) {
      if (event.key === 'Escape') {
        this.closeCalendar()
      }
    }
  }
}
</script>
