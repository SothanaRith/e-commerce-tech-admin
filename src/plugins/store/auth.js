import { defineStore } from 'pinia'

export const useAuthStore = defineStore('userAuth', () => {
    
  const login = async data => {
    try {
      const res = await $api('/auth/login', {
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

  const sendOtp = async data => {
    try {
      const res = await $api('/auth/send-otp', {
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

  const register = async data => {
    try {
      const res = await $api('/auth/register', {
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

  const otpVerify = async data => {
    try {
      const res = await $api('/auth/verify-otp', {
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

  const logout = async data => {
    try {
      const res = await $api('/auth/logout', {
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
  
  const resetPassword = async data => {
    try {
      const res = await $api('/auth/reset-password', {
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
    register,
    otpVerify,
    sendOtp,
    logout,
    resetPassword,
    refreshToken,
  }
})
