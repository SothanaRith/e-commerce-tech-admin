<template>
  <li
    :key="props.user.id"
    class="chat-contact cursor-pointer d-flex align-center"
    :class="{ 'chat-contact-active': isChatContactActive }"
    @click="openChatOfContact(props.user.id)"
  >
    <div
      v-if="props.isChatContact && getUnseenMessages > 0"
      class="d-flex flex-column align-self-start"
    >
      <div class="text-body-2 text-disabled whitespace-no-wrap">
        {{ props.isChatContact && props.user.chat ? props.user.chat.lastMessage.time : 'No time' }}
      </div>
      <VBadge
        v-if="getUnseenMessages"
        color="error"
        inline
        :content="getUnseenMessages"
        class="ms-auto"
      />
    </div>
  </li>

  <!-- Display all messages for the active contact -->
  <div
    v-if="store.activeChat?.chat?.messages && store.activeChat.chat.messages.length > 0"
    class="chat-messages d-flex flex-column gap-2 pa-4"
  >
    <VCard
      v-for="message in store.activeChat.chat.messages"
      :key="message.id"
      class="pa-3 message-card"
      :class="[
        message.sender_id !== 3 ? 'message-received' : 'message-sent'
      ]"
      elevation="1"
    >
      <div class="d-flex flex-column">
        <div v-if="message.file_url">
          <VImg
            :src="`${baseUrl}${message.file_url}`"
            alt="Message Image"
            class="message-image"
          />
        </div>
        <div v-if="message.file_url" class="mt-2">

        </div>

        <!-- Message content -->
        <div class="text-body-1">
          {{ message.message }}
        </div>

        <div class="d-flex flex-row align-center gap-1">
          <VAvatar
            v-if="message.sender_id !== 3"
            size="20"
            :variant="!props.user.coverImage ? 'tonal' : undefined"
            color="primary"
          >
            <VImg
              v-if="props.user.coverImage"
              :src="`${baseUrl}${props.user.coverImage}`"
              alt="John Doe"
            />
            <span
              v-else
              class="av-text"
            >{{ avatarText(props.user.name) }}</span>
          </VAvatar>
          <div class="text-sm-body-2 text-disabled mt-1 text-end">
            {{ new Date(message.timestamp).toLocaleTimeString() }}
          </div>
        </div>
      </div>
    </VCard>
  </div>
</template>

<script setup>
import { useChatStore } from '@/views/apps/chat/useChatStore'
import { computed, watch, nextTick, onMounted } from 'vue'

const props = defineProps({
  isChatContact: {
    type: Boolean,
    default: false,
  },
  user: {
    type: Object,
    required: true,
  },
  chatLogRef: Object,
})

const store = useChatStore()
const baseUrl = import.meta.env.VITE_BASE_IMG_URL

// Computed property for checking if the contact is active
const isChatContactActive = computed(() => {
  const isActive = store.activeChat?.contact.id === props.user.id

  return props.isChatContact ? isActive : !store.activeChat?.chat && isActive
})

// Get unread message count for this contact
const getUnseenMessages = computed(() => {
  const contactChat = store.chatsContacts.find(
    chat => chat.sender.id === props.user.id || chat.receiver.id === props.user.id,
  )

  return contactChat && !contactChat.is_read ? 1 : 0
})

// Open the chat when a contact is clicked
const openChatOfContact = userId => {
  store.setChatDetails(store.profileUser.id, userId)
  store.getChatHistory(store.profileUser.id, userId)

  // Mark unseen messages as read
  const contact = store.chatsContacts.find(c => c.receiver.id === userId || c.sender.id === userId)
  if (contact) {
    contact.is_read = true
  }
  scrollToBottomInChatLog()
}

onMounted(() => {
  store.connectSocket()
})

// Scroll to the bottom of the chat window
const scrollToBottomInChatLog = () => {
  if (!props.chatLogRef?.value) return
  const scrollEl = props.chatLogRef.value.$el || props.chatLogRef.value

  scrollEl.scrollTop = scrollEl.scrollHeight
}
</script>

<style scoped>
.chat-contact {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.chat-contact-active {
  background-color: #f0f0f0; /* Active contact background */
}

.message-sent {
  align-self: flex-end;
  background-color: rgba(23, 251, 32, 0.11);
  color: white;
  border-radius: 16px 16px 4px 16px;
}

.message-received {
  align-self: flex-start;
  border-radius: 16px 16px 16px 4px;
}

.chat-messages {
  margin-top: 15px;
}

.message-card {
  max-width: 60%;
  word-wrap: break-word;
}
.av-text {
  font-size: 8px;
}
</style>
