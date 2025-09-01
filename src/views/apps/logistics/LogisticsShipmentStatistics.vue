<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useDashboardStore } from '@/plugins/store/dashboard'

const dashboard = useDashboardStore()

// ── period & month/year filter ────────────────────────────────────────────────
const period = ref('monthly') // 'daily' | 'monthly' | 'all' | 'month'
const month = ref(new Date().getMonth() + 1) // 1-12
const year  = ref(new Date().getFullYear())

// quick lists
const monthItems = [
  { title: 'Jan', value: 1 }, { title: 'Feb', value: 2 }, { title: 'Mar', value: 3 },
  { title: 'Apr', value: 4 }, { title: 'May', value: 5 }, { title: 'Jun', value: 6 },
  { title: 'Jul', value: 7 }, { title: 'Aug', value: 8 }, { title: 'Sep', value: 9 },
  { title: 'Oct', value: 10 },{ title: 'Nov', value: 11 },{ title: 'Dec', value: 12 },
]
// let user choose nearby years quickly
const currentY = new Date().getFullYear()
const yearItems = Array.from({ length: 7 }, (_, i) => currentY - 3 + i) // [Y-3 .. Y+3]

// load data
const load = async () => {
  await dashboard.fetchSalesChart({
    period: period.value,
    month: period.value === 'month' ? month.value : undefined,
    year:  period.value === 'month' ? year.value  : undefined,
  })
}

onMounted(load)
watch([period, month, year], load, { deep: false })

// ── colors & theme tokens ─────────────────────────────────────────────────────
const chartColors = {
  orders: '#FFB400', // column
  income: '#28C76F', // line
}

const headingColor = 'rgba(var(--v-theme-on-background), var(--v-high-emphasis-opacity))'
const labelColor   = 'rgba(var(--v-theme-on-background), var(--v-medium-emphasis-opacity))'
const borderColor  = 'rgba(var(--v-border-color), var(--v-border-opacity))'

// ── helpers ───────────────────────────────────────────────────────────────────
const parseYMD = d => {
  // Accepts 'YYYY-MM-DD' or 'YYYY-MM'
  if (!d) return new Date(NaN)
  const parts = d.split('-').map(Number)
  if (parts.length === 3) {
    const [y, m, day] = parts
    return new Date(y, m - 1, day)
  } else if (parts.length === 2) {
    const [y, m] = parts
    return new Date(y, m - 1, 1)
  }
  return new Date(NaN)
}

const fmtDay = dt => `${dt.getDate()} ${dt.toLocaleString(undefined, { month: 'short' })}`       // "6 Aug"
const fmtMonth = dt => `${dt.toLocaleString(undefined, { month: 'short' })} ${dt.getFullYear()}`  // "Aug 2025"

const formatLabel = d => {
  // Use length to detect: 'YYYY-MM-DD' => 10, 'YYYY-MM' => 7
  if (typeof d === 'string' && d.length === 7) return fmtMonth(parseYMD(d))
  return fmtDay(parseYMD(d))
}

const monthTitle = (dates) => {
  if (!dates.length) return '—'
  const first = parseYMD(dates[0])
  return `${first.toLocaleString(undefined, { month: 'long' })} ${first.getFullYear()}`
}

const niceMax = (n, step = 5) => {
  if (!Number.isFinite(n) || n <= 0) return step
  const raw = Math.ceil(n / step) * step
  return Math.max(step, raw)
}

// ── computed series & categories ──────────────────────────────────────────────
const sortedChart = computed(() => {
  const arr = Array.isArray(dashboard.salesChart) ? dashboard.salesChart : []
  return [...arr].sort((a, b) => parseYMD(a.date) - parseYMD(b.date))
})

const categories = computed(() => sortedChart.value.map(r => formatLabel(r.date)))
const ordersData = computed(() => sortedChart.value.map(r => Number(r.orders ?? 0)))
const incomeData = computed(() => sortedChart.value.map(r => Number(r.revenue ?? 0)))

const ordersMax = computed(() => niceMax(Math.max(0, ...ordersData.value), 5))
const incomeMax = computed(() => {
  const max = Math.max(0, ...incomeData.value)
  const step = max > 5000 ? 1000 : max > 2000 ? 500 : max > 1000 ? 200 : 100
  return niceMax(max, step)
})

// subtitle per period
const subtitleText = computed(() => {
  if (period.value === 'daily') {
    const d = new Date()
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
  }
  if (period.value === 'month') {
    // specific month/year
    const d = new Date(year.value, month.value - 1, 1)
    return `${d.toLocaleString(undefined, { month: 'long' })} ${d.getFullYear()}`
  }
  if (period.value === 'all') return 'All time'
  // 'monthly' (current month from API)
  return monthTitle(sortedChart.value.map(r => r.date))
})

// apex series
const series = computed(() => ([
  { name: 'Orders', type: 'column', data: ordersData.value },
  { name: 'Income', type: 'line',   data: incomeData.value },
]))

// config
const salesConfig = computed(() => ({
  chart: {
    type: 'line',
    stacked: false,
    parentHeightOffset: 0,
    toolbar: { show: false },
    zoom: { enabled: false },
  },
  markers: {
    size: 5,
    colors: '#fff',
    strokeColors: chartColors.income,
    hover: { size: 6 },
    borderRadius: 4,
  },
  stroke: {
    curve: 'smooth',
    width: [0, 3],
    lineCap: 'round',
  },
  legend: {
    show: true,
    position: 'bottom',
    markers: { width: 8, height: 8, offsetX: -3 },
    height: 40,
    itemMargin: { horizontal: 10, vertical: 0 },
    fontSize: '15px',
    fontFamily: 'Open Sans',
    fontWeight: 400,
    labels: { colors: headingColor, useSeriesColors: false },
    offsetY: 10,
  },
  grid: { strokeDashArray: 8, borderColor },
  colors: [chartColors.orders, chartColors.income],
  fill: { opacity: [1, 1] },
  plotOptions: {
    bar: {
      columnWidth: '30%',
      borderRadius: 4,
      borderRadiusApplication: 'end',
    },
  },
  dataLabels: { enabled: false },
  xaxis: {
    categories: categories.value,
    tickAmount: Math.min(10, categories.value.length),
    labels: { style: { colors: labelColor, fontSize: '13px', fontWeight: 400 } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: [
    {
      seriesName: 'Orders',
      tickAmount: 4,
      min: 0,
      max: ordersMax.value,
      labels: {
        style: { colors: labelColor, fontSize: '13px', fontWeight: 400 },
        formatter(val) { return `${val}` },
      },
    },
    {
      opposite: true,
      seriesName: 'Income',
      tickAmount: 5,
      min: 0,
      max: incomeMax.value,
      labels: {
        style: { colors: chartColors.income, fontSize: '13px', fontWeight: 400 },
        formatter(val) { return `$${val}` },
      },
    },
  ],
  responsive: [
    {
      breakpoint: 1400,
      options: {
        chart: { height: 320 },
        xaxis: { labels: { style: { fontSize: '10px' } } },
        legend: {
          itemMargin: { vertical: 0, horizontal: 10 },
          fontSize: '13px',
          offsetY: 12,
        },
      },
    },
    { breakpoint: 1025, options: { chart: { height: 415 }, plotOptions: { bar: { columnWidth: '50%' } } } },
    { breakpoint: 982,  options: { plotOptions: { bar: { columnWidth: '30%' } } } },
    { breakpoint: 480,  options: { chart: { height: 250 }, legend: { offsetY: 7 } } },
  ],
}))
</script>

<template>
  <VCard>
    <VCardItem
      title="Orders & Income"
      :subtitle="`Totals for ${subtitleText}`"
    >
      <template #append>
        <div class="d-flex ga-2">
          <VSelect
            v-model="period"
            :items="[
              { title: 'Today', value: 'daily' },
              { title: 'This Month', value: 'monthly' },
              { title: 'Specific Month…', value: 'month' },
              { title: 'All Time', value: 'all' },
            ]"
            variant="tonal"
            density="comfortable"
            hide-details
            style="min-width: 160px"
          />
          <template v-if="period === 'month'">
            <VSelect
              v-model="month"
              :items="monthItems"
              item-title="title"
              item-value="value"
              label="Month"
              density="comfortable"
              hide-details
              variant="outlined"
              style="width: 120px"
            />
            <VSelect
              v-model="year"
              :items="yearItems"
              label="Year"
              density="comfortable"
              hide-details
              variant="outlined"
              style="width: 110px"
            />
          </template>
        </div>
      </template>
    </VCardItem>

    <VCardText>
      <VueApexCharts
        id="sales-statistics"
        type="line"
        height="320"
        :options="salesConfig"
        :series="series"
      />
    </VCardText>
  </VCard>
</template>

<style lang="scss">
@use "@core/scss/template/libs/apex-chart.scss";

#sales-statistics {
  .apexcharts-legend-text { font-size: 16px !important; }
  .apexcharts-legend-series {
    border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
    border-radius: 0.375rem;
    block-size: 83%;
    padding-block: 4px;
    padding-inline: 16px 12px;
  }
}
</style>
