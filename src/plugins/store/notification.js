import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useApi } from '@/composables/useApi'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])

  const fetchNotifications = async () => {
    try {
      const response = await useApi('/notifications')

      const rawData = response.data?.value || []

      if (Array.isArray(rawData)) {
        notifications.value = rawData.map(n => {
          let parsed = {}
          try {
            parsed = JSON.parse(n.data || '{}')
          } catch (e) {
            console.warn('Failed to parse JSON for notification:', n.id, e)
          }

          return {
            id: n.id,
            title: parsed.title || 'Untitled',
            subtitle: parsed.subtitle || 'N/A',
            purpose: parsed.purpose || 'N/A',
            date: parsed.date,
            staff: parsed.staff,
            icon: parsed.icon || 'mdi-check-circle',
            color: parsed.color,
            isSeen: parsed.isSeen ?? false,
            time: parsed.time || n.created_at,
          }
        })
      } else {
        console.error('Expected an array, got:', rawData)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }



  const markAsRead = id => {
    notifications.value = notifications.value.map(notification =>
      notification.id === id ? { ...notification, isSeen: true } : notification,
    )
  }

  const markAllAsRead = () => {
    notifications.value = notifications.value.map(notification => ({
      ...notification,
      isSeen: true,
    }))
  }

  const markAsUnread = id => {
    notifications.value = notifications.value.map(notification =>
      notification.id === id ? { ...notification, isSeen: false } : notification,
    )
  }

  const removeNotification = id => {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  return {
    notifications,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    markAsUnread,
    removeNotification,
  }
})
