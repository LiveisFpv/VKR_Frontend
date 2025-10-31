import { api } from '@/api/base/useBaseApi'
import type {
  UserLoginRequest,
  UserRegisterRequest,
  UserUpdateRequest,
  UserResponse,
  TokenResReq,
  UserListResponse,
  UserListQuery,
} from './types'
import { FRONTEND_BASE_URL } from '@/config'

export const SSOApi = {
  login(payload: UserLoginRequest) {
    return api.post<TokenResReq>('/auth/login', payload).then((r) => r.data)
  },
  logout() {
    return api.post<void>('/auth/logout').then((r) => r.data)
  },
  refresh() {
    return api.post<TokenResReq>('/auth/refresh').then((r) => r.data)
  },
  authenticate() {
    return api.get<UserResponse>('/auth/authenticate').then((r) => r.data)
  },
  create(payload: UserRegisterRequest) {
    return api.post<UserResponse>('/auth/create', payload).then((r) => r.data)
  },
  // Explicitly named user update method
  updateUser(payload: UserUpdateRequest) {
    return api.put<UserResponse>('/auth/update', payload).then((r) => r.data)
  },
  // Note: use axios `params` so redirect_url is URL-encoded correctly
  oauth(provider: string, redirectPath: string) {
    const redirect_url = `${FRONTEND_BASE_URL}${redirectPath}`
    return api
      .get<void>(`/oauth/${encodeURIComponent(provider)}` as const, {
        params: { redirect_url },
      })
      .then((r) => r.data)
  },
  // Helper to build a full URL for a top-level browser redirect
  oauthUrl(provider: string, redirectPath: string) {
    const encodedRedirect = encodeURIComponent(`${FRONTEND_BASE_URL}${redirectPath}`)
    return `${api.defaults.baseURL}/oauth/${encodeURIComponent(provider)}?redirect_url=${encodedRedirect}`
  },
  // Admin: fetch all users
  getUsers(params?: UserListQuery) {
    return api.get<UserListResponse>('/auth/users', { params }).then((r) => r.data)
  },
}
