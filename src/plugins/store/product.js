import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useApi } from '@/composables/useApi'
import { createUrl } from "@core/composable/createUrl"

export const useProductStore = defineStore('userProduct', () => {
  const searchQuery = ref('')
  const selectedCategory = ref()
  const selectedStatus = ref()
  const selectedStock = ref()
  const itemsPerPage = ref(10)
  const page = ref(1)
  const sortBy = ref()
  const orderBy = ref()
  const isLoading = ref()
  const selectedRows = ref([])

  const product = ref([])
  const productData = ref()
  const category = ref([])
  const totalProduct = ref(0)
  const router = useRouter()
  const productName = ref('')
  const productSKU = ref('')
  const productPrice = ref(499)
  const productDescription = ref('<p>Product description</p>')
  const productCategory = ref(null)
  const relatedProducts = ref([])

  const productVariants = ref([
    {
      sku: '',
      price: 0,
      stock: 0,
      attributes: [{ name: '', value: '' }],
    },
  ])

  const fetchProduct = async () => {
    const { data } = await useApi(createUrl('/product/search/1', {
      query: {
        query: searchQuery.value,
        page: page.value,
        size: itemsPerPage.value,
        sortBy: sortBy.value,
        orderBy: orderBy.value,
        category: selectedCategory.value,
        status: selectedStatus.value,
        inStock: selectedStock.value,
      },
    }))

    product.value = data.value?.data || []
    totalProduct.value = data.value?.pagination?.totalItems || 0
  }

  const fetchProductById = async id => {
    const { data } = await useApi(createUrl(`/product/get-product/${id}/1`, {
    }))

    console.log(data.value)
    productData.value = data.value

    return data.value
  }

  const updateProduct = async (id, formData) => {
    if (isLoading.value) {
      return
    }

    isLoading.value = true

    try {
      await $api(`/product/update-product/${id}`, {
        method: 'POST',
        body: formData,
      })
      await fetchProduct()
      isLoading.value = false
      router.push({ name: 'apps-ecommerce-product-list' })
    } catch (e) {
      isLoading.value = false
    }
  }

  const fetchCategory = async () => {
    const { data } = await useApi(createUrl('category/get-all-categories', {
    }))

    console.log(data)
    category.value = data.value?.categories || []
  }
  
  const addCategory = async formData => {

    await $api('/category/create-category', {
      method: 'POST',
      body: formData,
    })

    await fetchCategory()
  }

  const updateOptions = options => {
    sortBy.value = options.sortBy[0]?.key
    orderBy.value = options.sortBy[0]?.order
  }

  watch(
    [searchQuery, sortBy, orderBy, itemsPerPage, page, selectedCategory, selectedStatus, selectedStock],
    fetchProduct,
    { immediate: true },
  )

  const addProduct = async formData => {
    if (isLoading.value) {
      return
    }

    isLoading.value = true

    try {
      await $api('/product/create-product', {
        method: 'POST',
        body: formData,
      })
      await fetchProduct()
      router.push({ name: 'apps-ecommerce-product-list' })
    } catch (e) {
      isLoading.value = false
    }
  }

  const editProduct = async (id, productDataInput) => {
    await $api(`/product/update-product/${id}`, {
      method: 'POST',
      body: JSON.stringify(productDataInput),
      headers: { 'Content-Type': 'application/json' },
    })
    await fetchProduct()
  }

  const deleteProduct = async id => {
    await $api(`/product/delete/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })
    await fetchProduct()
  }

  const updateTotalStock = async productId => {
    try {
      const { data } = await useApi(`/product/${productId}/update-stock`, {
        method: 'PATCH',
      })

      // Optional: refetch product list to reflect the updated stock
      await fetchProduct()

      return data.value
    } catch (error) {
      console.error('Failed to update total stock:', error)
      throw error
    }
  }

  return {
    searchQuery,
    selectedCategory,
    selectedStatus,
    selectedStock,
    itemsPerPage,
    page,
    sortBy,
    orderBy,
    selectedRows,
    product,
    category,
    totalProduct,
    updateOptions,
    fetchProduct,
    addProduct,
    editProduct,
    deleteProduct,
    fetchCategory,
    addCategory,
    updateTotalStock,
    updateProduct,
    fetchProductById,
    productData,
  }
})
