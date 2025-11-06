import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export interface PaperCard {
  key: string
  id?: string
  title: string
  abstract: string
  year?: number
  pdfUrl?: string
  landingUrl?: string
  isOpenAccess?: boolean
  sourceName?: string
}

export interface ChatMessage {
  id: string
  query: string
  createdAt: number
  results: PaperCard[]
}

export interface ChatSession {
  id: string
  title: string
  createdAt: number
  messages: ChatMessage[]
}

function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export const useChatStore = defineStore('chat', () => {
  const chats = ref<ChatSession[]>([])
  const activeChatId = ref<string | null>(null)

  const history = computed(() => chats.value)
  const activeChat = computed<ChatSession | null>(() => {
    return chats.value.find((chat) => chat.id === activeChatId.value) ?? null
  })

  function createChat(initialTitle = 'New search') {
    const id = makeId()
    const chat: ChatSession = {
      id,
      title: initialTitle,
      createdAt: Date.now(),
      messages: [],
    }
    chats.value = [chat, ...chats.value]
    activeChatId.value = id
    return chat
  }

  function ensureChat() {
    if (!activeChatId.value || !activeChat.value) {
      return createChat()
    }
    return activeChat.value
  }

  function setActiveChat(id: string) {
    if (activeChatId.value === id) return
    const chat = chats.value.find((item) => item.id === id)
    if (!chat) return
    activeChatId.value = id
  }

  function addMessage(query: string, results: PaperCard[]) {
    const chat = ensureChat()
    const message: ChatMessage = {
      id: makeId(),
      query,
      createdAt: Date.now(),
      results,
    }
    chat.messages.push(message)
    if (chat.messages.length === 1) {
      chat.title = query || chat.title
    }
    activeChatId.value = chat.id
    return message
  }

  function renameChat(id: string, nextTitle: string) {
    const chat = chats.value.find((item) => item.id === id)
    if (!chat) return false
    const title = nextTitle.trim()
    if (!title) return false
    chat.title = title
    return true
  }

  function deleteChat(id: string) {
    const index = chats.value.findIndex((item) => item.id === id)
    if (index === -1) return false
    const nextChats = [...chats.value]
    nextChats.splice(index, 1)
    chats.value = nextChats
    if (activeChatId.value === id) {
      activeChatId.value = chats.value[0]?.id ?? null
    }
    return true
  }

  return {
    chats,
    history,
    activeChat,
    activeChatId,
    createChat,
    setActiveChat,
    addMessage,
    renameChat,
    deleteChat,
  }
})
