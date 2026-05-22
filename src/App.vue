<template>
  <main class="app-shell">
    <section class="converter">
      <div class="converter__header">
        <p class="eyebrow">NBRB exchange rates</p>
        <h1>Currency to BYN</h1>
      </div>

      <form class="converter__form" @submit.prevent>
        <BaseField label="Currency">
          <BaseSelect
            v-model="selectedCurrency"
            :options="currencyOptions"
            :disabled="loading && !currencies.length"
          />
        </BaseField>

        <BaseField label="Amount">
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
        Copy BYN value
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
  min-height 100vh
  display grid
  place-items center
  padding 24px

.converter
  width min(100%, 440px)
  padding 28px
  border 1px solid #d8e1ef
  border-radius 8px
  background #fff
  box-shadow 0 18px 45px rgba(41, 57, 87, .12)

.converter__header
  margin-bottom 24px

.converter__form
  display grid
  gap 18px
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
  font-size 2rem
  line-height 1.15

.result-panel
  display grid
  gap 6px
  margin-top 18px
  padding 18px
  border 1px solid #cfd9e8
  border-radius 8px
  background #f8fafc

.result-panel__label
  color #5b6f91
  font-size .85rem
  font-weight 700

.result-panel strong
  font-size 2rem
  line-height 1.15

.result-panel small
  color #5b6f91

.copy-button
  margin-top 18px

.status
  margin-top 16px

@media (max-width: 520px)
  .app-shell
    align-items start
    padding 16px

  .converter
    padding 20px

  h1,
  .result-panel strong
    font-size 1.65rem
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
    convertedAmount() {
      if (!this.selectedRate || typeof this.amount !== 'number') {
        return null
      }

      return roundTo((this.amount * this.selectedRate.Cur_OfficialRate) / this.selectedRate.Cur_Scale)
    },
    formattedResult() {
      if (this.convertedAmount === null) {
        return this.loading ? 'Loading...' : '0.00 BYN'
      }

      return this.convertedAmount.toFixed(2) + ' BYN'
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
