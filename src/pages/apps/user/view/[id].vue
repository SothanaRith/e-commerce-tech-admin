<script setup>
import { ref } from 'vue'
import { useUserStore } from "@/plugins/store/user"
import { useRoute } from 'vue-router'

const baseUrl = import.meta.env.VITE_BASE_IMG_URL
const route = useRoute()
const useUser = useUserStore()

const isNewPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)

const newPassword = ref('')
const confirmPassword = ref('')

const resolveUserRoleVariant = role => {
  if (role === 'subscriber') return { color: 'warning', icon: 'tabler-user' }
  if (role === 'author') return { color: 'success', icon: 'tabler-circle-check' }
  if (role === 'maintainer') return { color: 'primary', icon: 'tabler-chart-pie-2' }
  if (role === 'editor') return { color: 'info', icon: 'tabler-pencil' }
  if (role === 'admin') return { color: 'secondary', icon: 'tabler-server-2' }

  return { color: 'primary', icon: 'tabler-user' }
}

await useUser.fetchUserById(route.params.id)

const email = ref(useUser.userData.email)

const changePassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    alert('Passwords do not match!')

    return
  }

  const passwordData = {
    password: newPassword.value,
  }

  await useUser.editUser(route.params.id, passwordData)
  newPassword.value = ''
  confirmPassword.value = ''
}

const changeEmail = async () => {
  const emailData = {
    email: email.value,
  }

  await useUser.editUser(route.params.id, emailData)
  alert('Email updated successfully')
}
</script>

<template>
  <VRow v-if="useUser.userData">
    <VCol cols="12">
      <VCard v-if="useUser.userData">
        <VCardText class="text-center pt-12">
          <!-- 👉 Avatar -->
          <VAvatar
            rounded
            :size="100"
            :color="!useUser.userData.avatarImg ? 'primary' : undefined"
            :variant="!useUser.userData.avatarImg ? 'tonal' : undefined"
          >
            <VImg
              v-if="useUser.userData.avatarImg"
              :src="`${baseUrl}${useUser.userData.avatarImg}`"
            />
            <span
              v-else
              class="text-5xl font-weight-medium"
            >
              {{ avatarText(useUser.userData.userName) }}
            </span>
          </VAvatar>

          <!-- 👉 User fullName -->
          <h5 class="text-h5 mt-4">
            {{ useUser.userData.userName }}
          </h5>

          <!-- 👉 Role chip -->
          <VChip
            label
            :color="resolveUserRoleVariant(useUser.userData.role).color"
            size="small"
            class="text-capitalize mt-4"
          >
            {{ useUser.userData.role }}
          </VChip>
        </VCardText>

        <VCardText>
          <!-- 👉 Details -->
          <h5 class="text-h5">
            Details
          </h5>
          <VDivider class="my-4" />

          <!-- 👉 User Details list -->
          <VList class="card-list mt-2">
            <VListItem>
              <VListItemTitle>
                <h6 class="text-h6">
                  Username:
                </h6>
                <div class="d-inline-block text-body-1">
                  {{ useUser.userData.userName }}
                </div>
              </VListItemTitle>
            </VListItem>

            <VListItem>
              <VListItemTitle>
                <h6 class="text-h6">
                  Email:
                </h6>
                <div class="d-inline-block text-body-1 text-capitalize">
                  {{ email }}
                </div>
              </VListItemTitle>
            </VListItem>

            <VListItem>
              <VListItemTitle>
                <h6 class="text-h6">
                  Status:
                </h6>
                <div class="d-inline-block text-body-1 text-capitalize">
                  {{ useUser.userData.status }}
                </div>
              </VListItemTitle>
            </VListItem>

            <VListItem>
              <VListItemTitle>
                <h6 class="text-h6">
                  Role:
                </h6>
                <div class="d-inline-block text-capitalize text-body-1">
                  {{ useUser.userData.role }}
                </div>
              </VListItemTitle>
            </VListItem>

            <VListItem>
              <VListItemTitle>
                <h6 class="text-h6">
                  Contact:
                </h6>
                <div class="d-inline-block text-body-1">
                  {{ useUser.userData.contact }}
                </div>
              </VListItemTitle>
            </VListItem>
          </VList>
        </VCardText>
      </VCard>
    </VCol>

    <!-- Change Password Section -->
    <VCol cols="12">
      <VCard title="Change Password">
        <VCardText>
          <VAlert
            closable
            variant="tonal"
            color="warning"
            class="mb-4"
            title="Ensure that these requirements are met"
            text="Minimum 8 characters long, uppercase & symbol"
          />

          <VForm @submit.prevent="changePassword">
            <VRow>
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="newPassword"
                  label="New Password"
                  placeholder="············"
                  :type="isNewPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isNewPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  @click:append-inner="isNewPasswordVisible = !isNewPasswordVisible"
                />
              </VCol>
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="confirmPassword"
                  label="Confirm Password"
                  placeholder="············"
                  :type="isConfirmPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isConfirmPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  @click:append-inner="isConfirmPasswordVisible = !isConfirmPasswordVisible"
                />
              </VCol>

              <VCol cols="12">
                <VBtn type="submit">
                  Change Password
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>

    <!-- Change Email Section -->
    <VCol cols="12">
      <VCard title="Change Email">
        <VCardText>
          <VForm @submit.prevent="changeEmail">
            <VRow>
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="email"
                  label="New Email"
                  type="email"
                  placeholder="Enter new email"
                  outlined
                  dense
                  solo
                  clearable
                />
              </VCol>

              <VCol cols="12">
                <VBtn type="submit">
                  Change Email
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
