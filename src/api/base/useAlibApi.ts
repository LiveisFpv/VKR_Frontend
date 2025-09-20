import { useAuthStore } from '@/stores/authStore'
import axios, { AxiosError } from 'axios'
import { ALIB_API_URL } from '@/config'

export const api = axios.create({
  baseURL: ALIB_API_URL,
  timeout: 20000,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const auth = useAuthStore()
  const token = auth.AccessToken
  if (token) {
    config.headers = config.headers ?? {}
    ;(config.headers as any).Authorization = `Bearer ${token}`
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
    const reqUrl = (original?.url || '') as string
    const isRefreshCall = reqUrl.includes('/auth/refresh')

    if (status === 401 && !(original as any)._retry && !isRefreshCall) {
      let refreshOk = true
      if (!isRefreshing) {
        isRefreshing = true
        try {
          await auth.refreshToken()
        } catch (e) {
          refreshOk = false
          // optionally clear access token on failed refresh
          try {
            if (auth.AccessToken) {
              await auth.logout()
            }
          } catch {}
        } finally {
          isRefreshing = false
          queue.forEach((res) => res())
          queue = []
        }
      } else {
        await new Promise<void>((res) => queue.push(res))
      }
      if (!refreshOk) {
        return Promise.reject(normalizeApiError(error))
      }
      ;(original as any)._retry = true
      return api(original)
    }
    return Promise.reject(normalizeApiError(error))
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
