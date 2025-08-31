<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useDashboardStore } from '@/plugins/store/dashboard'

// ── store ──────────────────────────────────────────────────────────────────────
const dashboard = useDashboardStore()

// force-monthly (matches your API)
const period = ref('monthly')

// fetch once on mount and whenever period changes (kept for future flexibility)
const load = async () => {
  await dashboard.fetchSalesChart(period.value) // returns array of { date:'YYYY-MM-DD', orders, revenue }
}

onMounted(load)
watch(period, load)

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
  // Handles 'YYYY-MM-DD' robustly in all browsers
  // Create a Date as UTC, then treat as local for label purposes
  const [y, m, day] = d.split('-').map(Number)
  
  return new Date(y, m - 1, day)
}

const formatDayLabel = d => {
  const dt = typeof d === 'string' ? parseYMD(d) : d

  // e.g. "6 Aug"
  return `${dt.getDate()} ${dt.toLocaleString(undefined, { month: 'short' })}`
}

const monthTitle = dates => {
  if (!dates.length) return '—'
  const dt = parseYMD(dates[0])
  
  return `${dt.toLocaleString(undefined, { month: 'long' })} ${dt.getFullYear()}`
}

const niceMax = (n, step = 5) => {
  if (!Number.isFinite(n) || n <= 0) return step
  const raw = Math.ceil(n / step) * step
  
  return Math.max(step, raw)
}

// ── computed series & categories from store ───────────────────────────────────
const sortedChart = computed(() => {
  const arr = Array.isArray(dashboard.salesChart) ? dashboard.salesChart : []
  
  return [...arr].sort((a, b) => parseYMD(a.date) - parseYMD(b.date))
})

const categories = computed(() => sortedChart.value.map(r => formatDayLabel(r.date)))
const ordersData = computed(() => sortedChart.value.map(r => Number(r.orders ?? 0)))
const incomeData = computed(() => sortedChart.value.map(r => Number(r.revenue ?? 0)))

const ordersMax = computed(() => niceMax(Math.max(0, ...ordersData.value), 5))

const incomeMax = computed(() => {
  // choose a “nice” step based on magnitude
  const max = Math.max(0, ...incomeData.value)
  const step = max > 5000 ? 1000 : max > 2000 ? 500 : max > 1000 ? 200 : 100
  
  return niceMax(max, step)
})

// subtitle like "Totals for August 2025"
const subtitleText = computed(() => monthTitle(sortedChart.value.map(r => r.date)))

// apex series object
const series = computed(() => ([
  { name: 'Orders', type: 'column', data: ordersData.value },
  { name: 'Income', type: 'line',   data: incomeData.value },
]))

// full options but with dynamic axes + categories
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
    width: [0, 3], // column, line
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
    labels: {
      style: { colors: labelColor, fontSize: '13px', fontWeight: 400 },
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },

  // Dual y-axes: left = Orders (count), right = Income ($)
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
        <!-- kept for future; currently fixed to 'monthly' -->
        <VBtn
          variant="tonal"
          append-icon="tabler-chevron-down"
        >
          Monthly
        </VBtn>
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
