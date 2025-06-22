<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/plugins/store/auth' // Adjust path if needed
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import authV2TwoStepIllustrationDark from '@images/pages/auth-v2-two-step-illustration-dark.png'
import authV2TwoStepIllustrationLight from '@images/pages/auth-v2-two-step-illustration-light.png'
import authV2MaskDark from '@images/pages/misc-mask-dark.png'
import authV2MaskLight from '@images/pages/misc-mask-light.png'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})

const authThemeImg = useGenerateImageVariant(authV2TwoStepIllustrationLight, authV2TwoStepIllustrationDark)
const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)
const router = useRouter()

const otp = ref('')
const isOtpInserted = ref(false)
const cooldown = ref(0)
let timer = null

const useAuth = useAuthStore()

const onFinish = () => {
  isOtpInserted.value = true
  setTimeout(() => {
    isOtpInserted.value = false
    router.push('/')
  }, 2000)
}

const startCooldown = () => {
  cooldown.value = 180
  timer = setInterval(() => {
    cooldown.value--
    if (cooldown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const handleResend = async () => {
  if (cooldown.value > 0) return
  await useAuth.sendOtp()
  startCooldown()
}

// 👇 Auto-send OTP and start cooldown on first mount
onMounted(async () => {
  // await useAuth.sendOtp()
  // startCooldown()
})

const formSubmitting = ref(false)

const verifyOtp = async () => {
  if (!otp.value || otp.value.length !== 6) return

  formSubmitting.value = true

  try {
    await useAuth.otpVerify({ otp: otp.value })
  } catch (err) {
    console.error('OTP verification failed:', err)
  } finally {
    formSubmitting.value = false
  }
}
</script>


<template>
  <RouterLink to="/">
    <div class="auth-logo d-flex align-center gap-x-3">
      <VNodeRenderer :nodes="themeConfig.app.logo" />
      <h1 class="auth-title">
        {{ themeConfig.app.title }}
      </h1>
    </div>
  </RouterLink>

  <VRow
    class="auth-wrapper bg-surface"
    no-gutters
  >
    <VCol
      md="8"
      class="d-none d-md-flex"
    >
      <div class="position-relative bg-background w-100 me-0">
        <div
          class="d-flex align-center justify-center w-100 h-100"
          style="padding-inline: 150px;"
        >
          <VImg
            max-width="468"
            :src="authThemeImg"
            class="auth-illustration mt-16 mb-2"
          />
        </div>

        <img
          class="auth-footer-mask flip-in-rtl"
          :src="authThemeMask"
          alt="auth-footer-mask"
          height="280"
          width="100"
        >
      </div>
    </VCol>

    <VCol
      cols="12"
      md="4"
      class="auth-card-v2 d-flex align-center justify-center"
    >
      <VCard
        flat
        :max-width="500"
        class="mt-12 mt-sm-0 pa-6"
      >
        <VCardText>
          <h4 class="text-h4 mb-1">
            Two Step Verification 💬
          </h4>
          <p class="mb-1">
            We sent a verification code to your mobile. Enter the code from the mobile in the field below.
          </p>
          <h6 class="text-h6">
            ******1234
          </h6>
        </VCardText>

        <VCardText>
          <VForm @submit.prevent="verifyOtp">
            <VRow>
              <!-- email -->
              <VCol cols="12">
                <h6 class="text-body-1">
                  Type your 6 digit security code
                </h6>
                <VOtpInput
                  v-model="otp"
                  :disabled="isOtpInserted"
                  type="number"
                  class="pa-0"
                  @finish="onFinish"
                />
              </VCol>

              <!-- reset password -->
              <VCol cols="12">
                <VBtn
                  block
                  :loading="formSubmitting"
                  :disabled="formSubmitting || otp.length !== 6"
                  type="submit"
                >
                  Verify my account
                </VBtn>
              </VCol>

              <!-- back to login -->
              <VCol cols="12">
                <div class="d-flex justify-center align-center flex-wrap">
                  <span class="me-1">Didn't get the code?</span>
                  <VBtn
                    variant="text"
                    density="comfortable"
                    :disabled="cooldown > 0"
                    @click="handleResend"
                  >
                    <template v-if="cooldown > 0">
                      Resend in {{ Math.floor(cooldown / 60) }}m {{ cooldown % 60 }}s
                    </template>
                    <template v-else>
                      Resend
                    </template>
                  </VBtn>
                </div>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";

.v-otp-input {
  .v-otp-input__content {
    padding-inline: 0;
  }
}
</style>
