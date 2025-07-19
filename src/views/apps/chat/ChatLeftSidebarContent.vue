<script setup>
import { useChatStore } from '@/views/apps/chat/useChatStore'
import ChatContact from './ChatContact.vue'
import { computed, watch } from 'vue'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

const props = defineProps({
  search: {
    type: String,
    required: true,
  },
  isDrawerOpen: {
    type: Boolean,
    required: true,
  },
})

const baseUrl = import.meta.env.VITE_BASE_IMG_URL

const emit = defineEmits(['openChatOfContact', 'showUserProfile', 'close'])

const store = useChatStore()

const userData = useCookie('userData')

// Computed property to filter contacts based on search query
const filteredContacts = computed(() => {
  return store.contacts.filter(contact => {
    // Exclude contact if the user has no messages with them
    const hasMessagesWithContact = store.chatsContacts.some(chat =>
      (chat.sender_id === 3 && chat.receiver_id === contact.id) ||
      (chat.receiver_id === 3 && chat.sender_id === contact.id)
    )

    return contact.id !== 3 && hasMessagesWithContact
  })
})
</script>

<template>
  <!-- Perfect Scrollbar for the chat list -->
  <PerfectScrollbar
    tag="ul"
    class="chat-contacts-list"
  >
    <li
      v-if="filteredContacts.length === 0"
      class="no-chat-items-text text-disabled"
    >
      No chats found
    </li>

    <ChatContact
      v-for="contact in filteredContacts"
      :key="contact.id"
      :user="contact"
      is-chat-contact
      @open-chat-of-contact="$emit('openChatOfContact', contact.id)"
    />
  </PerfectScrollbar>
</template>

<style scoped>
.chat-contacts-list {
  padding: 0.75rem;
}

.chat-list-search {
  .v-field--focused {
    box-shadow: none !important;
  }
}
</style>
