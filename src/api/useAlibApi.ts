import { api } from '@/api/base/useAlibApi'
import type { AddPaperRequest, PapersResponse } from './types'

export const AlibApi = {
  search(search_text: string) {
    const text = `?text=${encodeURIComponent(search_text)}`
    return api.get<PapersResponse>(`/ai/search/papers${text}`).then((r) => r.data)
  },
  addPaper(payload: AddPaperRequest) {
    return api.post<void>('/ai/paper/add', payload).then((r) => r.data)
  },
}
