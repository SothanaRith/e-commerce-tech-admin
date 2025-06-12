// src/composables/useAlert.js
import { ref } from 'vue'

const message = ref('')
const type = ref('success')
const visible = ref(false)

const showAlert = (msg, alertType = 'success') => {
  message.value = msg
  type.value = alertType
  visible.value = true

  setTimeout(() => {
    visible.value = false
  }, 2000) // Hide after 2 seconds
}

export function useAlert() {
  return {
    message,
    type,
    visible,
    showAlert,
  }
}
