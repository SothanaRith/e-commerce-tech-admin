import { defineStore } from 'pinia'
import { useApi } from "@/composables/useApi.js"; // Adjust this import path based on your project structure

export const useChatStore = defineStore('chat', {
  state: () => ({
    contacts: [],
    chatsContacts: [],
    profileUser: undefined,
    activeChat: null,
  }),
  actions: {
    async fetchChatsAndContacts(q) {
      try {
        const { data } = await useApi(
          createUrl('chats/chats-and-contacts', {
            query: { q, userId: 3 }, // Adjust userId if necessary
            baseURL: '/api', // Ensure it points to your Node backend
          }),
        )

        // Ensure data.value is not null or undefined
        if (data?.value) {
          const { chatsContacts = [], contacts = [], profileUser = {} } = data.value

          // Update store with fetched data
          this.chatsContacts = chatsContacts
          this.contacts = contacts
          this.profileUser = profileUser
        } else {
          console.error("Invalid data received:", data)
        }
      } catch (error) {
        console.error('Error fetching chats and contacts:', error)
      }
    },

    async getChat(userId) {
      try {
        const res = await $api(`/chats`, {
          query: { senderId: this.profileUser?.id, receiverId: userId },
        })

        // Update the active chat in the store
        this.activeChat = {
          contact: this.contacts.find(c => c.id === userId),
          chat: { messages: res },
        }
      } catch (error) {
        console.error('Error fetching chat:', error)
      }
    },

    async sendMsg(message) {
      try {
        const senderId = this.profileUser?.id
        const receiverId = this.activeChat?.contact.id

        // Send the message to the API
        const response = await $api(`/chats`, {
          method: 'POST',
          body: { message, sender_id: senderId, receiver_id: receiverId },
        })

        const msg = response

        // If new chat is created (not in list of chats)
        const existingChat = this.chatsContacts.find(c => c.id === receiverId)
        if (!existingChat) {
          this.chatsContacts.push({
            ...this.activeChat.contact,
            chat: {
              id: msg.id,
              lastMessage: msg,
              unseenMsgs: 0,
              messages: [msg],
            },
          })
        } else {
          // Update the existing chat
          this.activeChat.chat.messages.push(msg)

          // existingChat.chat.lastMessage = msg
        }
      } catch (error) {
        console.error('Error sending message:', error)
      }
    },
  },
})
