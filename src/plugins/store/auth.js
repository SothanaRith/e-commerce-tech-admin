import { defineStore } from 'pinia'
import { useApi } from "@/composables/useApi.js"
import { createUrl } from "@core/composable/createUrl.js"

export const useAuthStore = defineStore('userAuth', () => {

  const route = useRoute()
  const router = useRouter()
  const ability = useAbility()

  const login = async data => {

    try {
      const res = await $api('/auth/login', {
        method: 'POST',
        body: {
          email: data.email,
          password: data.password,
        },
      })

      const { accessToken } = res

      useCookie('accessToken').value = accessToken

      router.push({ name: 'pages-authentication-two-steps-v2' })
    } catch (err) {
      console.error(err)
    }
  }

  const sendOtp = async () => {
    try {
      const token = useCookie('accessToken').value

      if (!token) {
        throw new Error('Access token is missing or expired')
      }

      const res = await $api('/auth/send-otp', {
        method: 'POST',
      })

      const { accessToken } = res

      useCookie('accessToken').value = accessToken

    } catch (err) {
      console.error('Send OTP failed:', err)
    }
  }


  const otpVerify = async data => {
    try {
      const res = await $api('/auth/verify-otp', {
        method: 'POST',
        body: {
          otp: data.otp, // ✅ Make sure this is defined
        },
      })

      const { accessToken } = res

      useCookie('accessToken').value = accessToken
        
      await fetchUserById()

      // await nextTick(() => {
      //   router.replace(route.query.to ? String(route.query.to) : '/dashboards/ecommerce')
      // })
        
    } catch (err) {
      console.error(err)
    }
  }

  const fetchUserById = async () => {
    try {
      const { data } = await useApi(createUrl(`/users/getProfile` ))

      useCookie('userData').value = data.value.filteredUser

      const userAbilityRules = [{
        'action': "manage",
        'subject': "all",
      }]

      useCookie('userAbilityRules').value = userAbilityRules
      ability.update(userAbilityRules)

    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }
    
  const refreshToken = async data => {
    try {
      const res = await $api('/auth/refresh-token', {
        method: 'POST',
        body: {
          email: data.value.email,
          password: data.value.password,
        },
      })

      const { accessToken, userData, userAbilityRules } = res

      useCookie('userAbilityRules').value = userAbilityRules
      ability.update(userAbilityRules)

      const { avatar, ...safeUserData } = userData

      useCookie('userData').value = safeUserData

      if (avatar && avatar.startsWith('data:image')) {
        localStorage.setItem('userAvatar', avatar)
      }

      useCookie('accessToken').value = accessToken
      await nextTick(() => {
        router.replace(route.query.to ? String(route.query.to) : '/')
      })
    } catch (err) {
      console.error(err)
    }
  }

  return {
    login,
    otpVerify,
    sendOtp,
    refreshToken,
  }
})
