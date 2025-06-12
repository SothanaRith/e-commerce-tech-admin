import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useApi } from '@/composables/useApi'
import { createUrl } from "@core/composable/createUrl"

export const useReviewStore = defineStore('userReview', () => {
  const searchQuery = ref('')
  const itemsPerPage = ref(10)
  const page = ref(1)
  const sortBy = ref()
  const orderBy = ref()
  const selectedRows = ref([])
  const reviewData = ref(null)

  const fetchReview = async () => {
    const { data } = await useApi(createUrl('/review/get-all-categories', {
      query: {
        q: searchQuery,
        sortBy,
        orderBy,
      },
    }))

    reviewData.value = data
  }

  const review = computed(() => reviewData.value?.value.data || [])
  const totalReview = computed(() => reviewData.value?.value.total || 0)

  const updateOptions = options => {
    sortBy.value = options.sortBy[0]?.key
    orderBy.value = options.sortBy[0]?.order
  }

  watch([searchQuery, sortBy, orderBy], async () => {
    await fetchReview()
  }, { immediate: true })

  // Add new review
  const addReview = async reviewData => {


    await $api('/review/create-review', {
      method: 'POST',
      body: JSON.stringify(reviewData),
      headers: { 'Content-Type': 'application/json' },
    })

    await fetchReview()
  }

  // Edit review
  const editReview = async (id, reviewData) => {

    await $api(`/review/update-review/${id}`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
      headers: { 'Content-Type': 'application/json' },
    })

    await fetchReview()
  }

  return {
    searchQuery,
    itemsPerPage,
    page,
    sortBy,
    orderBy,
    selectedRows,
    review,
    totalReview,
    updateOptions,
    fetchReview,
    addReview,
    editReview,
  }
})
