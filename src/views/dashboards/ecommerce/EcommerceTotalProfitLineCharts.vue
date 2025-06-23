<script setup>
import { useTheme } from 'vuetify'
import { hexToRgb } from '@layouts/utils'
import { computed, onMounted } from 'vue'
import { useDashboardStore } from "@/plugins/store/dashboard.js"

const vuetifyTheme = useTheme()
const dashboardStore = useDashboardStore()

onMounted(() => {
  dashboardStore.fetchSalesChart('monthly')
})

// Prepare chart series from backend sales data
const series = computed(() => [{
  name: 'Revenue',
  data: (dashboardStore.salesChart || []).map(entry => parseFloat(entry.revenue || 0)),
}])

// Format last point as current profit
const latestRevenue = computed(() => {
  const data = dashboardStore.salesChart || []
  if (data.length === 0) return 0
  
  return parseFloat(data[data.length - 1].revenue || 0)
})

// Simple percent change compared to previous point
const percentChange = computed(() => {
  const data = dashboardStore.salesChart || []
  if (data.length < 2) return 0
  const last = parseFloat(data[data.length - 1].revenue || 0)
  const prev = parseFloat(data[data.length - 2].revenue || 0)
  
  return prev ? (((last - prev) / prev) * 100).toFixed(2) : 0
})

const chartOptions = computed(() => {
  const currentTheme = vuetifyTheme.current.value.colors
  const variableTheme = vuetifyTheme.current.value.variables

  return {
    chart: {
      height: 90,
      type: 'line',
      parentHeightOffset: 0,
      toolbar: { show: false },
    },
    grid: {
      borderColor: `rgba(${hexToRgb(String(variableTheme['border-color']))},${variableTheme['border-opacity']})`,
      strokeDashArray: 6,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
      padding: {
        top: -18,
        left: -4,
        right: 7,
        bottom: -10,
      },
    },
    colors: [currentTheme.info],
    stroke: { width: 2 },
    tooltip: {
      enabled: false,
      shared: false,
      intersect: true,
      x: { show: false },
    },
    xaxis: {
      labels: { show: false },
      axisTicks: { show: false },
      axisBorder: { show: false },
    },
    yaxis: { labels: { show: false } },
    markers: {
      size: 3.5,
      fillColor: currentTheme.info,
      strokeColors: 'transparent',
      strokeWidth: 3.2,
      discrete: [{
        seriesIndex: 0,
        dataPointIndex: series.value[0].data.length - 1,
        fillColor: currentTheme.surface,
        strokeColor: currentTheme.info,
        size: 5,
        shape: 'circle',
      }],
      hover: { size: 5.5 },
    },
    responsive: [{
      breakpoint: 960,
      options: { chart: { height: 110 } },
    }],
  }
})
</script>

<template>
  <VCard>
    <VCardItem class="pb-3">
      <VCardTitle>Profit</VCardTitle>
      <VCardSubtitle>This Month</VCardSubtitle>
    </VCardItem>

    <VCardText>
      <VueApexCharts
        type="line"
        :options="chartOptions"
        :series="series"
        :height="68"
      />

      <div class="d-flex align-center justify-space-between gap-x-2 mt-3">
        <h4 class="text-h4 text-center font-weight-medium">
          ${{ latestRevenue.toLocaleString() }}
        </h4>
        <span
          class="text-sm"
          :class="parseFloat(percentChange) >= 0 ? 'text-success' : 'text-error'"
        >
          {{ parseFloat(percentChange) >= 0 ? '+' : '' }}{{ percentChange }}%
        </span>
      </div>
    </VCardText>
  </VCard>
</template>
