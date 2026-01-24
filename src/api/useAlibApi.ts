import { api } from '@/api/base/useAlibApi'
import type {
  AddPaperRequest,
  PapersResponse,
  ChatHistoryCreateRequest,
  ChatHistoryResponse,
  ChatResponse,
  ChatsResponse,
  CreateChatRequest,
} from './types'

export const AlibApi = {
  search(search_text: string, chat_id: number) {
    const id = `${encodeURIComponent(chat_id)}`
    const payload = <ChatHistoryCreateRequest>{
      text: search_text,
    }
    return api.post<PapersResponse>(`/chats/${id}/history`, payload).then((r) => r.data)
  },
  get_chat_history(chat_id: number) {
    const id = `${encodeURIComponent(chat_id)}`
    return api.get<ChatHistoryResponse>(`/chats/${id}/history`).then((r) => r.data)
  },
  create_chat(chat_name: string) {
    const payload = <CreateChatRequest>{
      title: chat_name,
    }
    return api.post<ChatResponse>(`/chats`, payload).then((r) => r.data)
  },
  get_all_user_chats() {
    return api.get<ChatsResponse>(`/chats`).then((r) => r.data)
  },
  addPaper(payload: AddPaperRequest) {
    return api.post<void>('/ai/paper/add', payload).then((r) => r.data)
  },
}
