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

  // Fetch user + global notifications
  const fetchNotifications = async (userId, page = 1, size = 10) => {
    try {
      const response = await useApi(`/notification/notifications/${userId}?page=${page}&size=${size}`)
      const data = response.data?.value?.data || {}

      notifications.value = data.notifications || []
      totalUnread.value = data.totalUnread || 0
      totalNotifications.value = data.totalNotifications || 0
      pagination.value = data.pagination || {}
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  // Create new notification (global if no userId)
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

  // Mark notification as read
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

  // Delete a notification
  const deleteNotification = async notificationId => {
    try {
      await useApi(`/notification/notifications/${notificationId}`, {
        method: 'DELETE',
      })
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  // Optional: Fetch global notifications only (if separate endpoint exists)
  const fetchGlobalNotifications = async (page = 1, size = 10) => {
    try {
      const response = await useApi(`/notification/notifications-global?page=${page}&size=${size}`)

      notifications.value = response.data?.value?.data?.notifications || []
    } catch (error) {
      console.error('Failed to fetch global notifications:', error)
    }
  }

  return {
    notifications,
    totalUnread,
    totalNotifications,
    pagination,
    fetchNotifications,
    fetchGlobalNotifications,
    createNotification,
    markAsRead,
    deleteNotification,
  }
})
