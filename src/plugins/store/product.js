import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useApi } from '@/composables/useApi'
import { createUrl } from "@core/composable/createUrl"

export const useProductStore = defineStore('userProduct', () => {
  const searchQuery = ref('')
  const itemsPerPage = ref(10)
  const page = ref(1)
  const sortBy = ref()
  const orderBy = ref()
  const selectedRows = ref([])
  const productData = ref(null)

  const fetchProduct = async () => {
    const { data } = await useApi(createUrl('/product/get-all-categories', {
      query: {
        q: searchQuery,
        sortBy,
        orderBy,
      },
    }))

    productData.value = data
  }

  const product = computed(() => productData.value?.value.data || [])
  const totalProduct = computed(() => productData.value?.value.total || 0)

  const updateOptions = options => {
    sortBy.value = options.sortBy[0]?.key
    orderBy.value = options.sortBy[0]?.order
  }

  watch([searchQuery, sortBy, orderBy], async () => {
    await fetchProduct()
  }, { immediate: true })

  // Add new product
  const addProduct = async productData => {


    await $api('/product/create-product', {
      method: 'POST',
      body: JSON.stringify(productData),
      headers: { 'Content-Type': 'application/json' },
    })

    await fetchProduct()
  }

  // Edit product
  const editProduct = async (id, productData) => {

    await $api(`/product/update-product/${id}`, {
      method: 'POST',
      body: JSON.stringify(productData),
      headers: { 'Content-Type': 'application/json' },
    })

    await fetchProduct()
  }

  return {
    searchQuery,
    itemsPerPage,
    page,
    sortBy,
    orderBy,
    selectedRows,
    product,
    totalProduct,
    updateOptions,
    fetchProduct,
    addProduct,
    editProduct,
  }
})
