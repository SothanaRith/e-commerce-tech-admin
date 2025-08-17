<script setup>
import { computed, onMounted } from 'vue'
import { useDashboardStore } from '@/plugins/store/dashboard'

const dashboardStore = useDashboardStore()

// Fetch monthly data (all-time) then pad to last 12 months
onMounted(async () => {
  if (!dashboardStore.salesChart?.length) {
    await dashboardStore.fetchSalesChart('all') // backend returns YYYY-MM buckets
  }
})

/* -------- 12-month padding -------- */
const padLast12Months = rows => {
  const now = new Date()
  const map = new Map((rows || []).map(r => [r.date, r]))
  const out = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const key = `${y}-${m}`
    out.push({
      date: key,
      label: d.toLocaleString(undefined, { month: 'short' }), // Jan, Feb, ...
      orders: Number(map.get(key)?.orders || 0),
      revenue: Number(map.get(key)?.revenue || 0),
    })
  }
  return out
}

const processed = computed(() => padLast12Months(dashboardStore.salesChart || []))

const categories = computed(() => processed.value.map(r => r.label))
const ordersData = computed(() => processed.value.map(r => r.orders))
const series = computed(() => [{ name: 'Orders', data: ordersData.value }])

const totalOrders = computed(() => ordersData.value.reduce((a, n) => a + n, 0))
const ordersDelta = computed(() => {
  if (ordersData.value.length < 2) return null
  const last = ordersData.value.at(-1)
  const prev = ordersData.value.at(-2)
  if (prev === 0 && last === 0) return 0
  if (prev === 0) return 100
  return ((last - prev) / prev) * 100
})

const trackBg = 'rgba(var(--v-track-bg))'
const backgroundBarColors = computed(() => Array(12).fill(trackBg))

const chartOptions = computed(() => ({
  chart: {
    height: 110,               // a bit taller for labels
    parentHeightOffset: 0,
    type: 'bar',
    toolbar: { show: false },
  },
  tooltip: { enabled: false },
  plotOptions: {
    bar: {
      barHeight: '100%',
      columnWidth: '30%',
      startingShape: 'rounded',
      endingShape: 'rounded',
      borderRadius: 4,
      colors: {
        backgroundBarColors: backgroundBarColors.value,
        backgroundBarRadius: 4,
      },
    },
  },
  colors: ['rgba(var(--v-theme-primary),1)'],
  grid: {
    show: false,
    padding: { top: -20, left: -16, bottom: 10, right: -6 }, // bottom padding for month labels
  },
  dataLabels: { enabled: false },
  legend: { show: false },
  xaxis: {
    categories: categories.value,
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: {
      show: true,              // ← show month names
      rotate: 0,
      trim: true,
      offsetY: 2,
      style: { fontSize: '11px' },
    },
    tickPlacement: 'between',
  },
  yaxis: { labels: { show: false } },
  responsive: [
    { breakpoint: 1441, options: { plotOptions: { bar: { columnWidth: '30%', borderRadius: 4 } } } },
    { breakpoint: 1368, options: { plotOptions: { bar: { columnWidth: '48%' } } } },
    { breakpoint: 1264, options: { plotOptions: { bar: { borderRadius: 6, columnWidth: '30%', colors: { backgroundBarRadius: 6 } } } } },
    { breakpoint: 960,  options: { plotOptions: { bar: { columnWidth: '22%', borderRadius: 4 } } } },
    { breakpoint: 768,  options: { plotOptions: { bar: { columnWidth: '28%' } } } },
    { breakpoint: 600,  options: { plotOptions: { bar: { columnWidth: '32%', borderRadius: 4 }, colors: { backgroundBarRadius: 9 } } } },
    { breakpoint: 479,  options: { plotOptions: { bar: { borderRadius: 4 }, colors: { backgroundBarRadius: 9 } }, grid: { padding: { right: -15, left: -15 } } } },
    { breakpoint: 400,  options: { plotOptions: { bar: { borderRadius: 3 } } } },
  ],
}))
</script>

<template>
  <VCard>
    <VCardItem class="pb-3">
      <VCardTitle>Orders</VCardTitle>
      <VCardSubtitle>Last 12 Months</VCardSubtitle>
    </VCardItem>

    <VCardText>
      <VueApexCharts
        :options="chartOptions"
        :series="series"
        :height="130"
      />

      <div class="d-flex align-center justify-space-between gap-x-2 mt-3">
        <h4 class="text-h4 text-center">{{ totalOrders.toLocaleString() }}</h4>
        <div
          v-if="ordersDelta !== null"
          class="text-sm"
          :class="Number(ordersDelta) >= 0 ? 'text-success' : 'text-error'"
        >
          {{ Number(ordersDelta) >= 0 ? '+' : '−' }}
          {{ Math.abs(Number(ordersDelta)).toFixed(1) }}%
        </div>
      </div>
    </VCardText>
  </VCard>
</template>

<script>
import VueApexCharts from 'vue3-apexcharts'

export default {
  components: { VueApexCharts },
}
</script>
