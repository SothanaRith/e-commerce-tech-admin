<script setup>
import { ref, computed, nextTick, onMounted, watch } from 'vue'
import { useDisplay, useTheme } from 'vuetify'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { useChat } from "@/views/apps/chat/useChat.js"
import { useChatStore } from '@/views/apps/chat/useChatStore.js'
import { themes } from '@/plugins/vuetify/theme.js'
import ChatLeftSidebarContent from '@/views/apps/chat/ChatLeftSidebarContent.vue'
import ChatLog from '@/views/apps/chat/ChatLog.vue'

definePage({ meta: { layoutWrapperClasses: 'layout-content-height-fixed' } })

const vuetifyDisplays = useDisplay()
const store = useChatStore()
const { resolveAvatarBadgeVariant } = useChat()
const { name } = useTheme()
const { isLeftSidebarOpen } = useResponsiveLeftSidebar(vuetifyDisplays.smAndDown)
const chatLogPS = ref()

const scrollToBottomInChatLog = () => {
  if (!chatLogPS.value) return
  const scrollEl = chatLogPS.value.$el || chatLogPS.value

  scrollEl.scrollTop = scrollEl.scrollHeight
}

const q = ref('')

watch(q, val => {
  if (store.fetchChatsAndContacts) store.fetchChatsAndContacts(val)
}, { immediate: true })

const startConversation = () => {
  if (!vuetifyDisplays.mdAndUp.value) isLeftSidebarOpen.value = true
}

// Chat message
const msg = ref('')
const previewImage = ref(null)
const refInputEl = ref()

const handleImageChange = e => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()

  reader.onload = () => {
    previewImage.value = reader.result
  }
  reader.readAsDataURL(file)
}

const clearMessageForm = () => {
  msg.value = ''
  previewImage.value = null
  if (refInputEl.value) refInputEl.value.value = ''
  nextTick(() => scrollToBottomInChatLog())
}

const sendMessage = async () => {
  if (!msg.value && !previewImage.value) return

  let base64Image = null
  if (previewImage.value) {
    base64Image = previewImage.value.split(',')[1]
  }

  await store.sendMessage(msg.value, base64Image)
  clearMessageForm()
}

const openChatOfContact = async userId => {
  if (!store.profileUser?.id) return
  store.setChatDetails(store.profileUser.id, userId)
  await store.getChatHistory(store.profileUser.id, userId)
  msg.value = ''

  const contact = store.chatsContacts.find(c => c.receiver.id === userId || c.sender.id === userId)
  if (contact) contact.is_read = true
  if (vuetifyDisplays.smAndDown.value) isLeftSidebarOpen.value = false
  nextTick(() => scrollToBottomInChatLog())
}

watch(() => store.activeChat?.chat.messages, (newVal, oldVal) => {
  if (newVal?.length > (oldVal?.length || 0)) nextTick(() => scrollToBottomInChatLog())
})

const isUserProfileSidebarOpen = ref(false)
const isActiveChatUserProfileSidebarOpen = ref(false)

const chatContentContainerBg = computed(() => {
  let color = 'transparent'
  if (themes) color = themes?.[name.value].colors?.background
  
  return color
})

const triggerFileInput = () => {
  if (refInputEl.value && typeof refInputEl.value.click === 'function') {
    refInputEl.value.click()
  }
}

onMounted(() => {
  store.connectSocket()
})
</script>

<template>
  <VLayout
    class="chat-app-layout"
    style="z-index: 0;"
  >
    <!-- 👉 Left sidebar -->
    <VNavigationDrawer
      v-model="isLeftSidebarOpen"
      data-allow-mismatch
      absolute
      touchless
      location="start"
      width="370"
      :temporary="$vuetify.display.smAndDown"
      class="chat-list-sidebar"
      :permanent="$vuetify.display.mdAndUp"
    >
      <ChatLeftSidebarContent
        v-model:is-drawer-open="isLeftSidebarOpen"
        v-model:search="q"
        @open-chat-of-contact="openChatOfContact"
        @show-user-profile="isUserProfileSidebarOpen = true"
        @close="isLeftSidebarOpen = false"
      />
    </VNavigationDrawer>

    <!-- 👉 Chat content -->
    <VMain class="chat-content-container">
      <!-- 👉 Active chat header -->
      <div
        v-if="store.activeChat"
        class="d-flex flex-column h-100"
      >
        <div class="active-chat-header d-flex align-center text-medium-emphasis bg-surface">
          <IconBtn
            class="d-md-none me-3"
            @click="isLeftSidebarOpen = true"
          >
            <VIcon icon="tabler-menu-2" />
          </IconBtn>

          <!-- Avatar and Name -->
          <div class="d-flex align-center cursor-pointer">
            <VBadge
              dot
              location="bottom right"
              offset-x="3"
              offset-y="0"
              :color="resolveAvatarBadgeVariant(store.activeChat.contact.status)"
              bordered
            >
              <VAvatar
                size="40"
                :variant="!store.activeChat.contact.coverImage ? 'tonal' : undefined"
                :color="!store.activeChat.contact.coverImage ? resolveAvatarBadgeVariant(store.activeChat.contact.status) : undefined"
                class="cursor-pointer"
              >
                <VImg
                  v-if="store.activeChat.contact.coverImage"
                  :src="store.activeChat.contact.coverImage"
                  :alt="store.activeChat.contact.name"
                />
                <span v-else>{{ avatarText(store.activeChat.contact.name) }}</span>
              </VAvatar>
            </VBadge>

            <div class="flex-grow-1 ms-4 overflow-hidden">
              <div class="text-h6 mb-0 font-weight-regular">
                {{ store.activeChat.contact.name }}
              </div>
              <p class="text-truncate mb-0 text-body-2">
                {{ store.activeChat.contact.role }}
              </p>
            </div>
          </div>
          <VSpacer />
        </div>
        <VDivider />

        <!-- Chat log -->
        <PerfectScrollbar
          ref="chatLogPS"
          tag="ul"
          :options="{ wheelPropagation: false }"
          class="flex-grow-1"
        >
          <ChatLog
            :user="store.activeChat.contact"
            :chat-log-ref="chatLogPS"
          />
        </PerfectScrollbar>

        <!-- Message form -->
        <!-- Message form -->
        <VForm
          class="chat-log-message-form mb-5 mx-5"
          @submit.prevent="sendMessage"
        >
          <VTextField
            :key="store.activeChat?.contact.id"
            v-model="msg"
            variant="solo"
            density="default"
            class="chat-message-input"
            placeholder="Type your message..."
            autofocus
          >
            <template #append-inner>
              <div class="d-flex gap-1">
                <IconBtn
                  append-icon="tabler-photo"
                  @click="triggerFileInput"
                >
                  <VIcon icon="tabler-photo" />
                </IconBtn>

                <div class="d-none d-md-block">
                  <VBtn
                    append-icon="tabler-send"
                    @click="sendMessage"
                  >
                    Send
                  </VBtn>
                </div>
                <IconBtn
                  class="d-block d-md-none"
                  @click="sendMessage"
                >
                  <VIcon icon="tabler-send" />
                </IconBtn>
              </div>
            </template>
          </VTextField>

          <!-- Preview Image -->
          <VImg
            v-if="previewImage"
            :src="previewImage"
            max-height="100"
            max-width="100"
            class="mt-2 rounded-lg elevation-2"
          />

          <!-- Hidden file input -->
          <input
            ref="refInputEl"
            type="file"
            name="file"
            accept=".jpeg,.png,.jpg,.gif"
            hidden
            @change="handleImageChange"
          />
        </VForm>
      </div>

      <!-- 👉 Start conversation -->
      <div
        v-else
        class="d-flex h-100 align-center justify-center flex-column"
      >
        <VAvatar
          size="98"
          variant="tonal"
          color="primary"
          class="mb-4"
        >
          <VIcon
            size="50"
            class="rounded-0"
            icon="tabler-message-2"
          />
        </VAvatar>
        <VBtn
          v-if="$vuetify.display.smAndDown"
          rounded="pill"
          @click="startConversation"
        >
          Start Conversation
        </VBtn>

        <p
          v-else
          style="max-inline-size: 40ch; text-wrap: balance;"
          class="text-center text-disabled"
        >
          Start connecting with the people by selecting one of the contacts on the left
        </p>
      </div>
    </VMain>
  </VLayout>
</template>

<style lang="scss">
@use "@styles/variables/vuetify";
@use "@core/scss/base/mixins";
@use "@layouts/styles/mixins" as layoutsMixins;

// Variables
$chat-app-header-height: 76px;

// Placeholders
%chat-header {
  display: flex;
  align-items: center;
  min-block-size: $chat-app-header-height;
  padding-inline: 1.5rem;
}

.chat-start-conversation-btn {
  cursor: default;
}

.chat-app-layout {
  border-radius: vuetify.$card-border-radius;

  @include mixins.elevation(vuetify.$card-elevation);

  $sel-chat-app-layout: &;

  @at-root {
    .skin--bordered {
      @include mixins.bordered-skin($sel-chat-app-layout);
    }
  }

  .active-chat-user-profile-sidebar,
  .user-profile-sidebar {
    .v-navigation-drawer__content {
      display: flex;
      flex-direction: column;
    }
  }

  .chat-list-header,
  .active-chat-header {
    @extend %chat-header;
  }

  .chat-list-sidebar {
    .v-navigation-drawer__content {
      display: flex;
      flex-direction: column;
    }
  }
}

.chat-content-container {
  /* stylelint-disable-next-line value-keyword-case */
  background-color: v-bind(chatContentContainerBg);

  // Adjust the padding so text field height stays 48px
  .chat-message-input {
    .v-field__input {
      font-size: 0.9375rem !important;
      line-height: 1.375rem !important;
      padding-block: 0.6rem 0.5rem;
    }

    .v-field__append-inner {
      align-items: center;
      padding-block-start: 0;
    }

    .v-field--appended {
      padding-inline-end: 8px;
    }
  }
}

.chat-user-profile-badge {
  .v-badge__badge {
    /* stylelint-disable liberty/use-logical-spec */
    min-width: 12px !important;
    height: 0.75rem;
    /* stylelint-enable liberty/use-logical-spec */
  }
}
</style>
