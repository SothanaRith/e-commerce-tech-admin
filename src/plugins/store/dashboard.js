import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useApi } from '@/composables/useApi'
import { createUrl } from '@core/composable/createUrl'

export const useDashboardStore = defineStore('dashboard', () => {
  const overview = ref(null)
  const salesChart = ref([])
  const topProducts = ref([])
  const recentOrders = ref([])
  const recentReviews = ref([])
  const orderStatusSummary = ref({})

  const fetchOverview = async () => {
    const { data } = await useApi('/product/overview')

    overview.value = data.value
  }

  const fetchSalesChart = async (period = 'monthly') => {
    const { data } = await useApi(createUrl('/product/sales-chart', {
      query: { period },
    }))

    salesChart.value = data.value
  }

  const fetchTopProducts = async () => {
    const { data } = await useApi('/product/top-products')

    topProducts.value = data.value
  }

  const fetchRecentOrders = async () => {
    const { data } = await useApi('/product/recent-orders')

    recentOrders.value = data.value
  }

  const fetchRecentReviews = async () => {
    const { data } = await useApi('/product/recent-reviews')

    recentReviews.value = data.value
  }

  const fetchOrderStatusSummary = async () => {
    const { data } = await useApi('/product/order-status-summary')

    orderStatusSummary.value = data.value
  }

  const loadDashboard = async () => {
    await Promise.all([
      fetchOverview(),
      fetchSalesChart(),
      fetchTopProducts(),
      fetchRecentOrders(),
      fetchRecentReviews(),
      fetchOrderStatusSummary(),
    ])
  }

  return {
    overview,
    salesChart,
    topProducts,
    recentOrders,
    recentReviews,
    orderStatusSummary,

    fetchOverview,
    fetchSalesChart,
    fetchTopProducts,
    fetchRecentOrders,
    fetchRecentReviews,
    fetchOrderStatusSummary,
    loadDashboard,
  }
})
