import { useAuthStore } from '@/stores/authStore'
import axios, { AxiosError } from 'axios'
import { SSO_CLIENT_ID_URL } from '@/config'

export const api = axios.create({
  baseURL: SSO_CLIENT_ID_URL,
  timeout: 10000,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const auth = useAuthStore()
  const token = auth.AccessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let queue: Array<() => void> = []

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const auth = useAuthStore()
    const original = error.config!
    const status = error.response?.status

    if (status === 401 && !original.headers?.['x-retry']) {
      if (!isRefreshing) {
        await new Promise<void>((res) => queue.push(res))
      } else {
        try {
          isRefreshing = true
          await auth.refreshToken()
        } finally {
          isRefreshing = false
          queue.forEach((res) => res())
          queue = []
        }
      }
      original.headers = { ...original.headers, 'x-retry': '1' }
      return api(original)
    }
    throw normalizeApiError(error)
  },
)

export class ApiError extends Error {
  status?: number
  details?: unknown
  constructor(message: string, status?: number, details?: unknown) {
    super(message)
    this.status = status
    this.details = details
  }
}

function normalizeApiError(err: AxiosError) {
  const status = err.response?.status
  const message = (err.response?.data as any)?.message || err.message || 'Request failed'
  const details = err.response?.data
  return new ApiError(message, status, details)
}
