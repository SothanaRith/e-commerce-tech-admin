import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useApi } from '@/composables/useApi'
import { createUrl } from "@core/composable/createUrl"

export const useOrderStore = defineStore('userOrder', () => {
  const searchQuery = ref('')
  const itemsPerPage = ref(10)
  const page = ref(1)
  const sortBy = ref()
  const orderBy = ref()
  const selectedRows = ref([])

  // Store for order data with categories (pending, delivered, completed)
  const orderData = ref({
    pending: [],
    delivered: [],
    completed: [],
  })

  // Fetch order data
  const fetchOrder = async () => {
    try {
      const { data } = await useApi(createUrl('/product/admin/orders/processed', {
        query: {
          q: searchQuery,
          sortBy,
          orderBy,
        },
      }))

      // Assign the fetched data to the correct categories
      orderData.value = {
        pending: data.value.pending || [],
        delivered: data.value.delivered || [],
        completed: data.value.completed || [],
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  // Computed properties for the categories
  const pending = computed(() => orderData.value.pending || [])
  const delivered = computed(() => orderData.value.delivered || [])
  const completed = computed(() => orderData.value.completed || [])
  const totalPending = computed(() => orderData.value.pending.length || 0)

  // Update sorting options
  const updateOptions = options => {
    sortBy.value = options.sortBy[0]?.key
    orderBy.value = options.sortBy[0]?.order
  }

  // Watch changes in search, sort, and order to fetch new data
  watch([searchQuery, sortBy, orderBy], async () => {
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
    updateOptions,
    fetchOrder,
    addOrder,
    editOrder,
    orderData,
  }
})
