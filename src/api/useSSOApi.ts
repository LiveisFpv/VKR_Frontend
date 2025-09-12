import { api } from '@/api/base/useBaseApi'
import type {
  UserLoginRequest,
  UserRegisterRequest,
  UserUpdateRequest,
  UserResponse,
  TokenResReq,
} from './types'

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
  update(payload: UserUpdateRequest) {
    return api.put<UserResponse>('/auth/update', payload).then((r) => r.data)
  },
}
