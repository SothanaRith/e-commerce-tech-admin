import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useApi } from '@/composables/useApi'
import { createUrl } from "@core/composable/createUrl"

export const usePaymentStore = defineStore('userPayment', () => {
  const searchQuery = ref('')
  const itemsPerPage = ref(10)
  const page = ref(1)
  const sortBy = ref()
  const orderBy = ref()
  const selectedRows = ref([])
  const paymentData = ref(null)

  const fetchPayment = async () => {
    const { data } = await useApi(createUrl('/payment/get-all-categories', {
      query: {
        q: searchQuery,
        sortBy,
        orderBy,
      },
    }))

    paymentData.value = data
  }

  const payment = computed(() => paymentData.value?.value.data || [])
  const totalPayment = computed(() => paymentData.value?.value.total || 0)

  const updateOptions = options => {
    sortBy.value = options.sortBy[0]?.key
    orderBy.value = options.sortBy[0]?.order
  }

  watch([searchQuery, sortBy, orderBy], async () => {
    await fetchPayment()
  }, { immediate: true })

  // Add new payment
  const addPayment = async paymentData => {


    await $api('/payment/create-payment', {
      method: 'POST',
      body: JSON.stringify(paymentData),
      headers: { 'Content-Type': 'application/json' },
    })

    await fetchPayment()
  }

  // Edit payment
  const editPayment = async (id, paymentData) => {

    await $api(`/payment/update-payment/${id}`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
      headers: { 'Content-Type': 'application/json' },
    })

    await fetchPayment()
  }

  return {
    searchQuery,
    itemsPerPage,
    page,
    sortBy,
    orderBy,
    selectedRows,
    payment,
    totalPayment,
    updateOptions,
    fetchPayment,
    addPayment,
    editPayment,
  }
})
