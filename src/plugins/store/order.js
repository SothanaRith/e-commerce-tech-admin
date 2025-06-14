import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useApi } from '@/composables/useApi'
import { createUrl } from "@core/composable/createUrl"

export const useOrderStore = defineStore('userOrder', () => {
  const searchQuery = ref('')
  const itemsPerPage = ref(10) // Number of items per page
  const page = ref(1) // Current page
  const sortBy = ref()
  const orderBy = ref()
  const selectedRows = ref([])

  // Store for order data with categories (pending, delivered, completed)
  const orderData = ref({
    pending: [],
    delivered: [],
    completed: [],
    totalPending: 0,
    totalDelivered: 0,
    totalCompleted: 0,
      
  })

  // Store for pagination info
  const pagination = ref({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    itemsPerPage: 10,
  })

  // Fetch order data with filters and pagination
  const fetchOrder = async () => {
    try {
      const { data } = await useApi(createUrl('/product/admin/orders/processed', {
        query: {
          q: searchQuery.value,
          sortBy: sortBy.value,
          orderBy: orderBy.value,
          itemsPerPage: itemsPerPage.value,
          page: page.value, // Add pagination params
        },
      }))

      // Assign the fetched data to the correct categories
      orderData.value = {
        pending: data.value.pending.orders || [],
        delivered: data.value.delivered.orders || [],
        completed: data.value.completed.orders || [],
        totalPending: data.value.pending.pagination.total || 0,
        totalDelivered: data.value.delivered.pagination.total,
        totalCompleted: data.value.completed.pagination.total,
      }

      // Update pagination info
      pagination.value = {
        total: data.value.pending.pagination.total || 0,
        totalPages: data.value.pending.pagination.totalPages || 0,
        currentPage: page.value,
        itemsPerPage: itemsPerPage.value,
      }

    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  // Computed properties for the categories
  const pending = computed(() => orderData.value.pending || [])
  const delivered = computed(() => orderData.value.delivered || [])
  const completed = computed(() => orderData.value.completed || [])

  // Computed property for total count of all orders
  const totalOrders = computed(() => pagination.value.total)

  const totalPending = computed(() => orderData.value.totalPending || 0)
  const totalDelivered = computed(() => orderData.value.totalDelivered|| 0)
  const totalCompleted = computed(() => orderData.value.totalCompleted || 0)


  // Update sorting options
  const updateOptions = options => {
    sortBy.value = options.sortBy[0]?.key
    orderBy.value = options.sortBy[0]?.order
  }

  // Watch changes in search, sort, order, pagination to fetch new data
  watch([searchQuery, sortBy, orderBy, itemsPerPage, page], async () => {
    await fetchOrder()
  }, { immediate: true })

  // Methods for CRUD operations (if needed in your view)
  const addOrder = async orderData => {
    try {
      await $api('/order/create-order', {
        method: 'POST',
        body: JSON.stringify(orderData),
        headers: { 'Content-Type': 'application/json' },
      })
      await fetchOrder()
    } catch (error) {
      console.error('Error adding order:', error)
    }
  }

  const editOrder = async (id, orderData) => {
    try {
      await $api(`/order/update-order/${id}`, {
        method: 'POST',
        body: JSON.stringify(orderData),
        headers: { 'Content-Type': 'application/json' },
      })
      await fetchOrder()
    } catch (error) {
      console.error('Error editing order:', error)
    }
  }

  return {
    searchQuery,
    itemsPerPage,
    page,
    sortBy,
    orderBy,
    selectedRows,
    pending,
    delivered,
    completed,
    totalPending,
    totalDelivered,
    totalCompleted,
    totalOrders, // Computed total orders across all categories
    pagination,  // Pagination info
    updateOptions,
    fetchOrder,
    addOrder,
    editOrder,
    orderData,
  }
})
