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
  const orderData = ref(null)

  const fetchOrder = async () => {
    const { data } = await useApi(createUrl('/product/admin/orders/processed', {
      query: {
        q: searchQuery,
        sortBy,
        orderBy,
      },
    }))

    orderData.value = data
      console.log(data)
  }

  const order = computed(() => orderData.value?.value.data || [])
  const totalOrder = computed(() => orderData.value?.value.total || 0)

  const updateOptions = options => {
    sortBy.value = options.sortBy[0]?.key
    orderBy.value = options.sortBy[0]?.order
  }

  watch([searchQuery, sortBy, orderBy], async () => {
    await fetchOrder()
  }, { immediate: true })

  // Add new order
  const addOrder = async orderData => {


    await $api('/order/create-order', {
      method: 'POST',
      body: JSON.stringify(orderData),
      headers: { 'Content-Type': 'application/json' },
    })

    await fetchOrder()
  }

  // Edit order
  const editOrder = async (id, orderData) => {

    await $api(`/order/update-order/${id}`, {
      method: 'POST',
      body: JSON.stringify(orderData),
      headers: { 'Content-Type': 'application/json' },
    })

    await fetchOrder()
  }

  return {
    searchQuery,
    itemsPerPage,
    page,
    sortBy,
    orderBy,
    selectedRows,
    order,
    totalOrder,
    updateOptions,
    fetchOrder,
    addOrder,
    editOrder,
  }
})
