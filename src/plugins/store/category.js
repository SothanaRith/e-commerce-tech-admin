import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useApi } from '@/composables/useApi'
import { createUrl } from "@core/composable/createUrl"

export const useCategoryStore = defineStore('userCategory', () => {
  const searchQuery = ref('')
  const itemsPerPage = ref(10)
  const page = ref(1)
  const sortBy = ref()
  const orderBy = ref()
  const selectedRows = ref([])
  const categoryData = ref(null)

  const fetchCategory = async () => {
    const { data } = await useApi(createUrl('/category/get-all-categories', {
      query: {
        q: searchQuery,
        sortBy,
        orderBy,
      },
    }))

    categoryData.value = data
  }

  const category = computed(() => categoryData.value?.value.data || [])
  const totalCategory = computed(() => categoryData.value?.value.total || 0)

  const updateOptions = options => {
    sortBy.value = options.sortBy[0]?.key
    orderBy.value = options.sortBy[0]?.order
  }

  watch([searchQuery, sortBy, orderBy], async () => {
    await fetchCategory()
  }, { immediate: true })

  // Add new category
  const addCategory = async categoryData => {


    await $api('/category/create-category', {
      method: 'POST',
      body: JSON.stringify(categoryData),
      headers: { 'Content-Type': 'application/json' },
    })

    await fetchCategory()
  }

  // Edit category
  const editCategory = async (id, categoryData) => {

    await $api(`/category/update-category/${id}`, {
      method: 'POST',
      body: JSON.stringify(categoryData),
      headers: { 'Content-Type': 'application/json' },
    })

    await fetchCategory()
  }

  return {
    searchQuery,
    itemsPerPage,
    page,
    sortBy,
    orderBy,
    selectedRows,
    category,
    totalCategory,
    updateOptions,
    fetchCategory,
    addCategory,
    editCategory,
  }
})
