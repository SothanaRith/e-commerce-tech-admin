import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useApi } from '@/composables/useApi'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])
  const totalUnread = ref(0)
  const totalNotifications = ref(0)

  const pagination = ref({
    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
  })

  // NEW: users-with-notifications state
  const usersWithNotifications = ref([]) // [{ user, notifications, totals }]

  const usersWithNotifsPagination = ref({
    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
    totalItems: 0,
  })

  // ---- EXISTING ----
  const fetchNotifications = async (userId, page = 1, size = 10) => {
    try {
      const response = await useApi(`/notification/notifications/${userId}?page=${page}&size=${size}`)
      const data = response?.data?.value?.data || {}

      notifications.value = data.notifications || []
      totalUnread.value = data.totalUnread || 0
      totalNotifications.value = data.totalNotifications || 0
      pagination.value = data.pagination || pagination.value
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  const createNotification = async payload => {
    try {
      await useApi('/notification/notifications', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (error) {
      console.error('Failed to create notification:', error)
    }
  }

  const markAsRead = async (notificationId, userId) => {
    try {
      await useApi(`/notification/notifications/${notificationId}`, {
        method: 'PATCH',
        body: JSON.stringify({ userId }),
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const deleteNotification = async notificationId => {
    try {
      await useApi(`/notification/notifications/${notificationId}`, { method: 'DELETE' })
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const fetchGlobalNotifications = async (page = 1, size = 10) => {
    try {
      const response = await useApi(`/notification/notifications-global?page=${page}&size=${size}`)
      const data = response?.data?.value?.data || {}

      notifications.value = data.notifications || []

      // optionally set totalNotifications.value if your API returns it
    } catch (error) {
      console.error('Failed to fetch global notifications:', error)
    }
  }

  // ---- NEW: users-with-notifications ----
  const fetchUsersWithNotifications = async (page = 1, size = 10, onlyUnread = false) => {
    try {
      const url = `/notification/users-with-notifications?page=${page}&size=${size}&onlyUnread=${onlyUnread}`
      const response = await useApi(url)
      console.log(response?.data?.value?.users)
      const data = response?.data?.value

      usersWithNotifications.value = data?.users || []
      usersWithNotifsPagination.value = data?.pagination || usersWithNotifsPagination.value
    } catch (error) {
      console.error('Failed to fetch users-with-notifications:', error)
    }
  }

  return {
    // state
    notifications,
    totalUnread,
    totalNotifications,
    pagination,
    usersWithNotifications,
    usersWithNotifsPagination,

    // actions
    fetchNotifications,
    fetchGlobalNotifications,
    createNotification,
    markAsRead,
    deleteNotification,
    fetchUsersWithNotifications,
  }
})
