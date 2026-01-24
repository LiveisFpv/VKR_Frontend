import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { ChatResponse } from '@/api/types'

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
  updatedAt?: number
  results: PaperCard[]
}

export interface ChatSession {
  id: number
  title: string
  createdAt: number
  updatedAt: number
  messages: ChatMessage[]
  historyLoaded: boolean
}

function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function toTimestamp(value?: string | number | null) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0
  }
  if (typeof value === 'string' && value) {
    const parsed = Date.parse(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

function sortChatsByUpdatedAt(chats: ChatSession[]) {
  return [...chats].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
}

function sortMessagesByUpdatedAt(messages: ChatMessage[]) {
  return [...messages].sort(
    (a, b) => (a.updatedAt || a.createdAt) - (b.updatedAt || b.createdAt),
  )
}

function mapChatFromApi(chat: ChatResponse, existing?: ChatSession): ChatSession {
  const updatedAt = toTimestamp(chat.updated_at)
  const createdAt = updatedAt || existing?.createdAt || 0
  return {
    id: chat.chat_id,
    title: chat.title?.trim() || existing?.title || 'New search',
    createdAt,
    updatedAt: updatedAt || existing?.updatedAt || 0,
    messages: existing?.messages || [],
    historyLoaded: existing?.historyLoaded || false,
  }
}

export const useChatStore = defineStore('chat', () => {
  const chats = ref<ChatSession[]>([])
  const activeChatId = ref<number | null>(null)

  const history = computed(() => chats.value)
  const activeChat = computed<ChatSession | null>(() => {
    return chats.value.find((chat) => chat.id === activeChatId.value) ?? null
  })

  function setChatsFromApi(items: ChatResponse[]) {
    const byId = new Map(chats.value.map((chat) => [chat.id, chat]))
    const mapped = items.map((chat) => mapChatFromApi(chat, byId.get(chat.chat_id)))
    chats.value = sortChatsByUpdatedAt(mapped)
    if (activeChatId.value) {
      const exists = chats.value.some((chat) => chat.id === activeChatId.value)
      if (!exists) {
        activeChatId.value = chats.value[0]?.id ?? null
      }
    } else {
      activeChatId.value = chats.value[0]?.id ?? null
    }
  }

  function upsertChatFromApi(chat: ChatResponse) {
    const existingIndex = chats.value.findIndex((item) => item.id === chat.chat_id)
    const existing = existingIndex >= 0 ? chats.value[existingIndex] : undefined
    const mapped = mapChatFromApi(chat, existing)
    const nextChats = [...chats.value]
    if (existingIndex >= 0) {
      nextChats.splice(existingIndex, 1, mapped)
    } else {
      nextChats.unshift(mapped)
    }
    chats.value = sortChatsByUpdatedAt(nextChats)
    activeChatId.value = mapped.id
    return mapped
  }

  function setActiveChat(id: number | null) {
    if (activeChatId.value === id) return
    if (id !== null) {
      const chat = chats.value.find((item) => item.id === id)
      if (!chat) return
    }
    activeChatId.value = id
  }

  function clearActiveChat() {
    activeChatId.value = null
  }

  function setMessages(chatId: number, messages: ChatMessage[]) {
    const chat = chats.value.find((item) => item.id === chatId)
    if (!chat) return
    chat.messages = sortMessagesByUpdatedAt(messages)
    chat.historyLoaded = true
    if (chat.messages.length) {
      const latest = Math.max(
        ...chat.messages.map((message) => message.updatedAt || message.createdAt),
      )
      if (latest > chat.updatedAt) {
        chat.updatedAt = latest
        chats.value = sortChatsByUpdatedAt(chats.value)
      }
    }
  }

  function markHistoryLoaded(chatId: number) {
    const chat = chats.value.find((item) => item.id === chatId)
    if (!chat) return
    chat.historyLoaded = true
  }

  function addMessage(chatId: number, query: string, results: PaperCard[]) {
    const chat = chats.value.find((item) => item.id === chatId)
    if (!chat) return null
    const now = Date.now()
    const message: ChatMessage = {
      id: makeId(),
      query,
      createdAt: now,
      updatedAt: now,
      results,
    }
    chat.messages = sortMessagesByUpdatedAt([...chat.messages, message])
    chat.historyLoaded = true
    chat.updatedAt = now
    chats.value = sortChatsByUpdatedAt(chats.value)
    activeChatId.value = chat.id
    return message
  }

  function renameChat(id: number, nextTitle: string) {
    const chat = chats.value.find((item) => item.id === id)
    if (!chat) return false
    const title = nextTitle.trim()
    if (!title) return false
    chat.title = title
    return true
  }

  function deleteChat(id: number) {
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

  function reset() {
    chats.value = []
    activeChatId.value = null
  }

  return {
    chats,
    history,
    activeChat,
    activeChatId,
    setActiveChat,
    clearActiveChat,
    setChatsFromApi,
    upsertChatFromApi,
    setMessages,
    markHistoryLoaded,
    addMessage,
    renameChat,
    deleteChat,
    reset,
  }
})
