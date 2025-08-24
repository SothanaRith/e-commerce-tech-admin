import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useApi } from '@/composables/useApi'
import { createUrl } from "@core/composable/createUrl"

export const useOrderStore = defineStore('userOrder', () => {
  const searchQuery = ref('')
  const status = ref('pending')
  const itemsPerPage = ref(10) // Number of items per page
  const page = ref(1) // Current page
  const sortBy = ref()
  const orderBy = ref()
  const startDate = ref('')
  const endDate = ref('')
  const orderSingleData = ref()
  const selectedRows = ref([])
  const currentOrderData = ref([])

  // Store for order data with categories (pending, delivered, completed)
  const orderData = ref({
    pending: [],
    delivery: [],
    delivered: [],
    completed: [],
    cancelled: [],
    totalPending: 0,
    totalDelivery: 0,
    totalDelivered: 0,
    totalCompleted: 0,
    totalCancelled: 0,

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
          searchQuery: searchQuery.value,
          sortBy: sortBy.value,
          orderBy: orderBy.value,
          startDate: startDate.value,
          endDate: endDate.value,
          itemsPerPage: itemsPerPage.value,
          page: page.value, // Add pagination params
        },
      }))

      // Assign the fetched data to the correct categories
      orderData.value = {
        pending: data.value.pending.orders || [],
        delivery: data.value.delivery.orders || [],
        delivered: data.value.delivered.orders || [],
        completed: data.value.completed.orders || [],
        cancelled: data.value.cancelled.orders || [],
        totalPending: data.value.pending.pagination.total || 0,
        totalDelivery: data.value.delivery.pagination.total,
        totalDelivered: data.value.delivered.pagination.total,
        totalCompleted: data.value.completed.pagination.total,
        totalCancelled: data.value.cancelled.pagination.total,
      }

      if (status.value === "pending") {

        currentOrderData.value = orderData.value.pending

        // Update pagination info
        pagination.value = {
          total: data.value.pending.pagination.total || 0,
          totalPages: data.value.pending.pagination.totalPages || 0,
          currentPage: page.value,
          itemsPerPage: itemsPerPage.value,
        }
      }  else if (status.value === "delivery") {
        currentOrderData.value = orderData.value.delivery

        // Update pagination info
        pagination.value = {
          total: data.value.delivery.pagination.total || 0,
          totalPages: data.value.delivery.pagination.totalPages || 0,
          currentPage: page.value,
          itemsPerPage: itemsPerPage.value,
        }
      } else if (status.value === "delivered") {
        currentOrderData.value = orderData.value.delivered

        // Update pagination info
        pagination.value = {
          total: data.value.delivered.pagination.total || 0,
          totalPages: data.value.delivered.pagination.totalPages || 0,
          currentPage: page.value,
          itemsPerPage: itemsPerPage.value,
        }
      } else if (status.value === "completed") {
        currentOrderData.value = orderData.value.completed

        // Update pagination info
        pagination.value = {
          total: data.value.completed.pagination.total || 0,
          totalPages: data.value.completed.pagination.totalPages || 0,
          currentPage: page.value,
          itemsPerPage: itemsPerPage.value,
        }
      } else if (status.value === "cancelled") {
        currentOrderData.value = orderData.value.cancelled

        // Update pagination info
        pagination.value = {
          total: data.value.cancelled.pagination.total || 0,
          totalPages: data.value.cancelled.pagination.totalPages || 0,
          currentPage: page.value,
          itemsPerPage: itemsPerPage.value,
        }
      }
      
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  // Computed property for total count of all orders
  const totalOrders = computed(() => pagination.value.total)
  const totalPending = computed(() => orderData.value.totalPending || 0)
  const totalDelivery = computed(() => orderData.value.totalDelivery|| 0)
  const totalDelivered = computed(() => orderData.value.totalDelivered|| 0)
  const totalCompleted = computed(() => orderData.value.totalCompleted || 0)
  const totalCancelled = computed(() => orderData.value.totalCancelled || 0)

  // Update sorting options
  const updateOptions = options => {
    sortBy.value = options.sortBy[0]?.key
    orderBy.value = options.sortBy[0]?.order
  }

  // Watch changes in search, sort, order, pagination to fetch new data
  watch([searchQuery, sortBy, orderBy, itemsPerPage, page], async () => {
    await fetchOrder()
  }, { immediate: true })

  const editOrder = async (id, status) => {
    try {
      await $api(`/product/orders/${id}/status`, {
        method: 'POST',
        body: JSON.stringify({
          status: status,
        }),
        headers: { 'Content-Type': 'application/json' },
      })
      await fetchOrder()
    } catch (error) {
      console.error('Error editing order:', error)
    }
  }

  const fetchOrderById = async orderId => {
    try {
      const { data } = await useApi(createUrl(`/product/orders/${orderId}/detail` ))

      console.log(data)
      orderSingleData.value = data.value
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }
  
  return {
    searchQuery,
    itemsPerPage,
    page,
    sortBy,
    orderBy,
    selectedRows,
    totalPending,
    totalDelivery,
    totalDelivered,
    totalCompleted,
    totalCancelled,
    totalOrders,
    pagination,
    updateOptions,
    fetchOrder,
    editOrder,
    orderData,
    status,
    startDate,
    endDate,
    currentOrderData,
    fetchOrderById,
    orderSingleData,
  }
})
