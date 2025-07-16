import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useApi } from '@/composables/useApi'
import { createUrl } from "@core/composable/createUrl"

export const usePosterStore = defineStore('userPoster', () => {
  const searchQuery = ref('')
  const itemsPerPage = ref(10)
  const page = ref(1)
  const sortBy = ref()
  const orderBy = ref()
  const selectedRows = ref([])
  const posterData = ref(null)
  const router = useRouter()
  const singlePoster = ref(null)

  const fetchPosterById = async id => {
    const { data } = await useApi(`/home/posters/${id}`)

    singlePoster.value = data.value
  }

  const fetchPoster = async () => {
    const { data } = await useApi(createUrl('/home/posters', {
      query: {
        q: searchQuery,
        sortBy,
        orderBy,
      },
    }))

    posterData.value = data.value
  }

  const poster = computed(() => posterData.value?.data || [])
  const totalPoster = computed(() => posterData.value?.data.length || 0)

  const updateOptions = options => {
    sortBy.value = options.sortBy[0]?.key
    orderBy.value = options.sortBy[0]?.order
  }

  watch([searchQuery, sortBy, orderBy], async () => {
    await fetchPoster()
  }, { immediate: true })

  // Get All Posters

  // Add new poster
  const addPoster = async posterData => {
    await $api('/home/posters', {
      method: 'POST',
      body: posterData,
    })

    await fetchPoster()
    router.push({ name: 'apps-ecommerce-poster-list' })
  }

  // Edit poster
  const editPoster = async (id, posterData) => {

    await $api(`/home/posters/${id}`, {
      method: 'PUT',
      body: posterData,
    })

    await fetchPoster()
  }

  const deletePoster = async id => {
    await $api(`/home/posters/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })

    await fetchPoster()
  }

  return {
    searchQuery,
    itemsPerPage,
    page,
    sortBy,
    orderBy,
    selectedRows,
    poster,
    totalPoster,
    updateOptions,
    fetchPoster,
    addPoster,
    editPoster,
    deletePoster,
    singlePoster,
    fetchPosterById,
  }
})
