import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useApi } from '@/composables/useApi'
import { createUrl } from "@core/composable/createUrl"

export const useUserStore = defineStore('userUser', () => {
  const searchQuery = ref('')
  const itemsPerPage = ref(10)
  const page = ref(1)
  const sortBy = ref()
  const orderBy = ref()
  const selectedRows = ref([])
  const userData = ref(null)

  const fetchUser = async () => {
    const { data } = await useApi(createUrl('/users/getUsers', {
      query: {
        q: searchQuery,
        sortBy,
        orderBy,
      },
    }))

    userData.value = data
  }

  const user = computed(() => userData.value?.value.users || [])
  const totalUser = computed(() => userData.value?.value.users.length || 0)

  const fetchUserById = async userId => {
    try {
      const { data } = await useApi(`/users/getProfile/${userId}`)
      const u = data.value

      if (u) {
        userData.value = {
          id: u.id,
          avatarImg: u.image,
          userName: u.name,
          email: u.email,
          userStatus: u.activate,
          team: u.team?.id ?? '',
          roles: u.roles?.map(role => ({ id: role.id, name: role.name })) || [],
        }
      }
    } catch (error) {
      console.error('❌ fetchUserById failed:', error)
    }
  }

  const updateOptions = options => {
    sortBy.value = options.sortBy[0]?.key
    orderBy.value = options.sortBy[0]?.order
  }

  watch([searchQuery, sortBy, orderBy], async () => {
    await fetchUser()
  }, { immediate: true })

  // Edit user
  const editUser = async (id, userData) => {

    await $api(`/users/updateProfile/${id}`, {
      method: 'POST',
      body: JSON.stringify(userData),
      headers: { 'Content-Type': 'application/json' },
    })
    await fetchUser()
  }

  const editUserProfile = async (id, userData) => {

    await $api(`/users/updateProfilePicture/${id}`, {
      method: 'POST',
      body: userData,
    })
    await fetchUser()
  }

  return {
    searchQuery,
    itemsPerPage,
    page,
    sortBy,
    orderBy,
    selectedRows,
    user,
    totalUser,
    updateOptions,
    fetchUser,
    fetchUserById,
    editUser,
    editUserProfile,
  }
})
