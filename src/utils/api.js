// eslint-disable-next-line import/extensions
import { useAlert } from "@/composables/useApiAlert.js"
import { ofetch } from 'ofetch'

const { showAlert } = useAlert()

export const $api = ofetch.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',

  async onRequest({ request, options }) {
    const accessToken = useCookie('accessToken').value

    if (accessToken) {
      options.headers = new Headers(options.headers)
      options.headers.append('Authorization', `Bearer ${accessToken}`)
    }

    console.log('📤 [API REQUEST]', request, options.method)
  },

  async onResponse({ request, response }) {
    console.log('✅ [API RESPONSE]', request, response.status)

    // Automatically show success message for 2xx responses
    if (response.status >= 200 && response.status < 300) {
      const msg = response._data?.message || 'Operation successful'

      showAlert(msg, 'success')
    }
  },

  async onRequestError({ request, error }) {
    console.error('❌ [API REQUEST ERROR]', request, error)

    // Automatically show error message on request errors
    showAlert(`Request failed: ${error.message || error}`, 'error')
  },

  async onResponseError({ request, response }) {

    console.error('❌ [API RESPONSE ERROR]')
    console.error('URL:', request)
    console.error('Status:', response.status)
    console.error('Response:', response._data)

    // Automatically show error message on response errors
    const msg = response._data?.message || `Response error: ${response.status}`

    showAlert(msg, 'error')
  },
})
