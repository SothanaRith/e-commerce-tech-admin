import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useApi } from '@/composables/useApi'
import { createUrl } from "@core/composable/createUrl"

export const useSlideStore = defineStore('userSlide', () => {
  const searchQuery = ref('')
  const itemsPerPage = ref(10)
  const page = ref(1)
  const sortBy = ref()
  const orderBy = ref()
  const selectedRows = ref([])
  const slideData = ref(null)
  const router = useRouter()

  const fetchSlide = async () => {
    const { data } = await useApi(createUrl('/home/slides', {
      query: {
        q: searchQuery,
        sortBy,
        orderBy,
      },
    }))

    slideData.value = data.value
  }

  const slide = computed(() => slideData.value?.data || [])
  const totalSlide = computed(() => slideData.value?.data.length || 0)

  const updateOptions = options => {
    sortBy.value = options.sortBy[0]?.key
    orderBy.value = options.sortBy[0]?.order
  }

  watch([searchQuery, sortBy, orderBy], async () => {
    await fetchSlide()
  }, { immediate: true })

  // Get All Slides

  // Add new slide
  const addSlide = async slideData => {
    await $api('/home/slides', {
      method: 'POST',
      body: JSON.stringify(slideData),
      headers: { 'Content-Type': 'application/json' },
    })

    await fetchSlide()
    router.push({ name: 'apps-ecommerce-slide-list' })
  }

  // Edit slide
  const editSlide = async (id, slideData) => {

    await $api(`/home/slides/${id}`, {
      method: 'PUT',
      body: JSON.stringify(slideData),
      headers: { 'Content-Type': 'application/json' },
    })

    await fetchSlide()
  }

  const deleteSlide = async id => {
    await $api(`/home/slides/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })

    await fetchSlide()
  }

  return {
    searchQuery,
    itemsPerPage,
    page,
    sortBy,
    orderBy,
    selectedRows,
    slide,
    totalSlide,
    updateOptions,
    fetchSlide,
    addSlide,
    editSlide,
    deleteSlide,
  }
})
