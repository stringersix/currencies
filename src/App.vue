<template>
  <main class="app-shell">
    <section class="converter">
      <div class="converter__header">
        <p class="eyebrow">NBRB exchange rates</p>
        <h1>{{ converterTitle }}</h1>
      </div>

      <form class="converter__form" @submit.prevent>
        <div class="direction-toggle" role="group" aria-label="Conversion direction">
          <button
            type="button"
            class="direction-toggle__option"
            :class="{ 'direction-toggle__option--active': isCurrencyToByn }"
            :aria-pressed="isCurrencyToByn"
            @click="conversionDirection = 'toByn'"
          >
            Currency to BYN
          </button>
          <button
            type="button"
            class="direction-toggle__option"
            :class="{ 'direction-toggle__option--active': !isCurrencyToByn }"
            :aria-pressed="!isCurrencyToByn"
            @click="conversionDirection = 'fromByn'"
          >
            BYN to currency
          </button>
        </div>

        <BaseField label="Currency">
          <BaseSelect
            v-model="selectedCurrency"
            :options="currencyOptions"
            :disabled="loading && !currencies.length"
          />
        </BaseField>

        <BaseField :label="amountLabel">
          <BaseNumberInput
            v-model="amount"
            :min="0"
            :precision="2"
            :step="1"
            placeholder="Type a number"
          />
        </BaseField>

        <BaseField label="Date">
          <BaseDateInput v-model="selectedDate" />
        </BaseField>
      </form>

      <BaseAlert
        v-if="error"
        class="status"
        type="error"
        :title="error"
      />

      <div class="result-panel">
        <span class="result-panel__label">Result</span>
        <strong>{{ formattedResult }}</strong>
        <small v-if="selectedRate">{{ rateDescription }}</small>
      </div>

      <BaseButton
        class="copy-button"
        :disabled="!canCopy"
        @click="copyResult"
      >
        Copy {{ resultCurrencyCode }} value
      </BaseButton>

      <BaseAlert
        v-if="copied"
        class="status"
        type="success"
        title="Copied"
      />
    </section>
  </main>
</template>

<style lang="stylus" scoped>
.app-shell
  width 100%
  min-height 100vh
  min-height 100dvh
  display grid
  place-items center
  padding clamp(16px, 4vw, 32px)

.converter
  width min(100%, 440px)
  min-width 0
  padding clamp(18px, 4vw, 28px)
  border 1px solid #d8e1ef
  border-radius 8px
  background #fff
  box-shadow 0 18px 45px rgba(41, 57, 87, .12)

.converter__header
  margin-bottom 24px

.converter__form
  display grid
  gap clamp(14px, 3vw, 18px)
  margin 0

.eyebrow
  margin 0 0 8px
  color #5b6f91
  font-size .78rem
  font-weight 700
  letter-spacing 0
  text-transform uppercase

h1
  margin 0
  font-size clamp(1.65rem, 7vw, 2rem)
  line-height 1.15

.direction-toggle
  display grid
  grid-template-columns repeat(2, minmax(0, 1fr))
  gap 4px
  padding 4px
  border 1px solid #c8d4e5
  border-radius 8px
  background #edf3f8

.direction-toggle__option
  min-width 0
  min-height 38px
  padding 0 10px
  border 0
  border-radius 6px
  background transparent
  color #4b5f7d
  cursor pointer
  font inherit
  font-size .88rem
  font-weight 800
  line-height 1.15
  transition background .16s ease, color .16s ease, box-shadow .16s ease

  &:hover
    color #162033

  &:focus-visible
    box-shadow 0 0 0 3px rgba(37, 116, 169, .18)
    outline none

.direction-toggle__option--active
  background #fff
  color #162033
  box-shadow 0 1px 3px rgba(41, 57, 87, .12)

.result-panel
  display grid
  gap 6px
  margin-top 18px
  min-width 0
  padding clamp(14px, 4vw, 18px)
  border 1px solid #cfd9e8
  border-radius 8px
  background #f8fafc

.result-panel__label
  color #5b6f91
  font-size .85rem
  font-weight 700

.result-panel strong
  min-width 0
  overflow-wrap anywhere
  font-size clamp(1.55rem, 7vw, 2rem)
  line-height 1.15

.result-panel small
  min-width 0
  color #5b6f91
  overflow-wrap anywhere

.copy-button
  margin-top 18px

.status
  margin-top 16px

@media (max-width: 520px)
  .app-shell
    align-items start
    padding 12px

  .converter
    width 100%
</style>

<script>
import BaseAlert from './components/BaseAlert.vue'
import BaseButton from './components/BaseButton.vue'
import BaseDateInput from './components/BaseDateInput.vue'
import BaseField from './components/BaseField.vue'
import BaseNumberInput from './components/BaseNumberInput.vue'
import BaseSelect from './components/BaseSelect.vue'
import { DEFAULT_CURRENCY, RATES_URL } from './consts/rates'

function roundTo(value, decimals = 2) {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

const ENGLISH_CURRENCY_NAMES = typeof Intl !== 'undefined' && Intl.DisplayNames
  ? new Intl.DisplayNames(['en'], { type: 'currency' })
  : null

function getEnglishCurrencyName(code) {
  return ENGLISH_CURRENCY_NAMES?.of(code) || code + ' currency'
}

export default {
  name: 'App',
  components: {
    BaseAlert,
    BaseButton,
    BaseDateInput,
    BaseField,
    BaseNumberInput,
    BaseSelect
  },
  data() {
    return {
      amount: 1,
      conversionDirection: 'toByn',
      selectedCurrency: DEFAULT_CURRENCY,
      selectedDate: todayIsoDate(),
      currencies: [],
      loading: false,
      error: '',
      copied: false
    }
  },
  computed: {
    currencyOptions() {
      if (!this.currencies.length) {
        return [{ value: DEFAULT_CURRENCY, label: 'USD - US Dollar' }]
      }

      return this.currencies.map(currency => ({
        value: currency.Cur_Abbreviation,
        label: currency.Cur_Abbreviation + ' - ' + getEnglishCurrencyName(currency.Cur_Abbreviation)
      }))
    },
    selectedRate() {
      return this.currencies.find(currency => currency.Cur_Abbreviation === this.selectedCurrency) || null
    },
    isCurrencyToByn() {
      return this.conversionDirection === 'toByn'
    },
    converterTitle() {
      return this.isCurrencyToByn ? 'Currency to BYN' : 'BYN to currency'
    },
    amountLabel() {
      return 'Amount in ' + (this.isCurrencyToByn ? this.selectedCurrency : 'BYN')
    },
    resultCurrencyCode() {
      return this.isCurrencyToByn ? 'BYN' : this.selectedCurrency
    },
    convertedAmount() {
      if (!this.selectedRate || typeof this.amount !== 'number') {
        return null
      }

      const ratePerUnit = this.selectedRate.Cur_OfficialRate / this.selectedRate.Cur_Scale

      if (this.isCurrencyToByn) {
        return roundTo(this.amount * ratePerUnit)
      }

      return roundTo(this.amount / ratePerUnit)
    },
    formattedResult() {
      if (this.convertedAmount === null) {
        return this.loading ? 'Loading...' : '0.00 ' + this.resultCurrencyCode
      }

      return this.convertedAmount.toFixed(2) + ' ' + this.resultCurrencyCode
    },
    rateDescription() {
      if (!this.selectedRate) {
        return ''
      }

      return 'Rate: ' + this.selectedRate.Cur_Scale + ' ' + this.selectedRate.Cur_Abbreviation + ' = ' + this.selectedRate.Cur_OfficialRate + ' BYN'
    },
    canCopy() {
      return this.convertedAmount !== null && !this.loading
    }
  },
  watch: {
    selectedDate() {
      this.fetchRates()
    },
    selectedCurrency() {
      this.copied = false
    },
    amount() {
      this.copied = false
    },
    conversionDirection() {
      this.copied = false
    }
  },
  mounted() {
    this.fetchRates()
  },
  methods: {
    async fetchRates() {
      this.loading = true
      this.error = ''
      this.copied = false

      try {
        const url = new URL(RATES_URL)

        if (this.selectedDate) {
          url.searchParams.set('onDate', this.selectedDate)
        }

        const response = await fetch(url)

        if (!response.ok) {
          throw new Error('Could not load currency rates.')
        }

        const data = await response.json()
        this.currencies = data.sort((first, second) => first.Cur_Abbreviation.localeCompare(second.Cur_Abbreviation))

        if (!this.selectedRate) {
          const defaultCurrency = this.currencies.find(currency => currency.Cur_Abbreviation === DEFAULT_CURRENCY)
          this.selectedCurrency = defaultCurrency?.Cur_Abbreviation || this.currencies[0]?.Cur_Abbreviation || DEFAULT_CURRENCY
        }
      } catch (error) {
        this.currencies = []
        this.error = error.message || 'Could not calculate the currency.'
      } finally {
        this.loading = false
      }
    },
    async copyResult() {
      if (!this.canCopy) {
        return
      }

      await navigator.clipboard.writeText(this.convertedAmount.toFixed(2))
      this.copied = true
    }
  }
}
</script>
