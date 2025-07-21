import { defineStore } from 'pinia'
import { useApi } from "@/composables/useApi.js" // Adjust this import path based on your project structure
import { io } from 'socket.io-client'

const baseUrl = import.meta.env.VITE_BASE_IMG_URL

export const useChatStore = defineStore('chat', {
  state: () => ({
    contacts: [],
    chatsContacts: [],
    profileUser: undefined,
    activeChat: null,
    socket: null,
    currentUserId: null,
    currentReceiverId: null,
  }),
  actions: {
    setChatDetails(senderId, receiverId) {
      this.currentUserId = senderId
      this.currentReceiverId = receiverId
      this.activeChat = {
        contact: this.contacts.find(c => c.id === receiverId) || { id: receiverId },
        chat: { messages: [] },
      }
    },

    connectSocket() {
      if (this.socket && this.socket.connected) return

      if (!this.currentUserId) {
        console.error('⚠️ User ID is not set.')

        return
      }

      this.socket = io(import.meta.env.VITE_BASE_URL, { transports: ['websocket'] })
      this.socket.connect()

      this.socket.on('connect', () => {
        console.log('✅ Connected to socket server')
        if (this.socket && this.socket.connected) {
          this.socket.emit('registerUser', this.currentUserId)
        }
      })

      this.socket.on('newMessage', data => {
        console.log('📩 New message received:', data)

        this.activeChat.chat.messages = [...this.activeChat.chat.messages, data]

        // Update active chat messages
        // if (this.activeChat && (data.sender_id === this.currentReceiverId || data.receiver_id === this.currentReceiverId)) {
        //   this.activeChat.chat.messages = [...this.activeChat.chat.messages, data]
        // }

        // Update chat list preview (lastMessage)
        const chatItem = this.chatsContacts.find(
          c => c.id === data.sender_id || c.id === data.receiver_id,
        )

        if (chatItem) {
          // chatItem.chat.lastMessage = data
        }
      })

      this.socket.on('disconnect', () => console.log('❌ Socket disconnected'))
    },

    async fetchChatsAndContacts(q) {
      try {
        const { data } = await useApi(
          createUrl('chats/chats-and-contacts', {
            query: { q, userId: this.currentUserId || 3 }, // fallback userId
            baseURL: '/api',
          }),
        )

        if (data?.value) {
          const { chatsContacts = [], contacts = [], profileUser = {} } = data.value

          this.chatsContacts = chatsContacts
          this.contacts = contacts
          this.profileUser = profileUser
        }
      } catch (error) {
        console.error('Error fetching chats and contacts:', error)
      }
    },

    async getChatHistory(senderId, receiverId) {
      try {
        const res = await $api(`/chats`, {
          query: { senderId, receiverId },
        })

        // Sort messages like Flutter
        res.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        this.activeChat = {
          contact: this.contacts.find(c => c.id === receiverId),
          chat: { messages: [...res] }, // Using a shallow copy to ensure reactivity
        }
      } catch (e) {
        console.error('❌ Failed to get chat history:', e)
      }
    },

    sendMessage(message) {
      if (!message.trim()) return
      if (this.socket && this.socket.connected) {
        this.socket.emit('sendMessage', {
          sender_id: 3,
          receiver_id: this.currentReceiverId,
          message,
        })
      } else {
        console.warn('⚠️ Socket is not connected')
      }
    },

    disconnectSocket() {
      this.socket?.disconnect()
      this.socket = null
    },
  },
  persist: true,
})
