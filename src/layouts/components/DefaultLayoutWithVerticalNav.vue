<script setup>
import navItems from '@/navigation/vertical'
import { themeConfig } from '@themeConfig'

// Components
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue'
import UserProfile from '@/layouts/components/UserProfile.vue'

const userData = useCookie('userData')

// @layouts plugin
import { VerticalNavLayout } from '@layouts'

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'

  return 'Good evening'
})
</script>

<template>
  <VerticalNavLayout :nav-items="navItems">
    <!-- 👉 navbar -->
    <template #navbar="{ toggleVerticalOverlayNavActive }">
      <div class="d-flex h-100 align-center">
        <IconBtn
          id="vertical-nav-toggle-btn"
          class="ms-n3 d-lg-none"
          @click="toggleVerticalOverlayNavActive(true)"
        >
          <VIcon
            size="26"
            icon="tabler-menu-2"
          />
        </IconBtn>

        <!--        <NavSearchBar class="ms-lg-n3" /> -->

        <div class="d-flex">
          <h5 class="text-h5 font-weight-thin">
            {{ greeting }},
          </h5>
          <h5 class="text-h5 font-weight-medium ms-1">
            {{ userData.name }}
          </h5>
        </div>
        <VSpacer />

        <!--        <NavBarI18n -->
        <!--          v-if="themeConfig.app.i18n.enable && themeConfig.app.i18n.langConfig?.length" -->
        <!--          :languages="themeConfig.app.i18n.langConfig" -->
        <!--        /> -->
        <NavbarThemeSwitcher class="me-1" />
        <!--        <NavbarShortcuts /> -->
        <!--        <NavBarNotifications class="me-1" /> -->
        <UserProfile />
      </div>
    </template>

    <!-- 👉 Pages -->
    <slot />

    <!-- 👉 Footer -->
   
    <!-- 👉 Customizer -->
    <TheCustomizer />
  </VerticalNavLayout>
</template>
