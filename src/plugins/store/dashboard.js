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

  // NEW: low stock state
  // shape: { mode: 'product'|'variant', threshold: number, data: [], pagination: {...} }
  const lowStock = ref({
    mode: 'product',
    threshold: 5,
    data: [],
    pagination: { currentPage: 1, pageSize: 10, totalItems: 0, totalPages: 0 },
  })

  const fetchOverview = async () => {
    const { data } = await useApi('/product/overview')
    overview.value = data.value
  }

  const fetchSalesChart = async (period = 'monthly') => {
    const { data } = await useApi(createUrl('/product/sales-chart', {
      query: { period: 'monthly' },
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

  // NEW: generic low-stock fetcher
  // options: { per?: 'product'|'variant', threshold?: number, recomputeTotal?: boolean, includeInactive?: boolean, page?: number, size?: number, userId?: number }
  const fetchLowStock = async (options = {}) => {
    const {
      per = 'product',
      threshold = 5,
      recomputeTotal = false,
      includeInactive = false,
      page = 1,
      size = 10,
      userId,
    } = options

    const { data } = await useApi(createUrl('/product/low-stock', {
      query: {
        per,
        threshold,
        recomputeTotal,
        includeInactive,
        page,
        size,
        ...(userId ? { userId } : {}),
      },
    }))

    // API returns: { mode, threshold, data, pagination }
    lowStock.value = data.value
  }

  // NEW: convenience helpers
  const fetchLowStockProducts = async (opts = {}) =>
    fetchLowStock({ per: 'product', ...opts })

  const fetchLowStockVariants = async (opts = {}) =>
    fetchLowStock({ per: 'variant', ...opts })

  const loadDashboard = async () => {
    await Promise.all([
      fetchOverview(),
      fetchSalesChart(),
      fetchTopProducts(),
      fetchRecentOrders(),
      fetchRecentReviews(),
      fetchOrderStatusSummary(),
      // optionally preload low stock too:
      // fetchLowStockProducts({ threshold: 5, page: 1, size: 10 }),
    ])
  }

  return {
    overview,
    salesChart,
    topProducts,
    recentOrders,
    recentReviews,
    orderStatusSummary,
    lowStock,

    fetchOverview,
    fetchSalesChart,
    fetchTopProducts,
    fetchRecentOrders,
    fetchRecentReviews,
    fetchOrderStatusSummary,
    fetchLowStock,
    fetchLowStockProducts,
    fetchLowStockVariants,
    loadDashboard,
  }
})
