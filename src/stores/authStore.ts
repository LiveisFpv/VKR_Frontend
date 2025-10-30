import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { SSOApi } from '@/api/useSSOApi'
import type {
  UserLoginRequest,
  UserRegisterRequest,
  UserUpdateRequest,
  UserResponse,
  TokenResReq,
  User,
} from '@/api/types'
export const useAuthStore = defineStore('auth', () => {
  const STORAGE_KEY = 'auth.access_token'
  let initial: string | null = null
  try {
    initial = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
  } catch (e) {
    initial = null
  }
  const AccessToken = ref<string | null>(initial) // ! Replace to initial
  const isAuthenticated = computed(() => !!AccessToken.value)
  const User = ref<User | null>(null)
  const roles = computed<string[]>(() =>
    (User.value?.roles ?? []).map((r) => r?.toUpperCase?.() || r),
  )
  const isAdmin = computed(() => roles.value.includes('ADMIN'))
  const isModerator = computed(() => roles.value.includes('MODERATOR'))
  const isUserRole = computed(() => roles.value.includes('USER'))
  const isWriterRole = computed(() => roles.value.includes('AUTHOR'))

  async function authenticate() {
    try {
      const userRes = await SSOApi.authenticate()
      // userRes.roles.push('MODERATOR')
      User.value = <User>{
        email: userRes.email,
        email_confirmed: userRes.email_confirmed,
        first_name: userRes.first_name,
        last_name: userRes.last_name,
        locale_type: userRes.locale_type,
        photo: userRes.photo,
        roles: userRes.roles,
      }
    } catch {
      AccessToken.value = null
    }
  }

  async function login(email: string, password: string) {
    try {
      const payload = <UserLoginRequest>{
        login: email,
        password: password,
      }
      const res = await SSOApi.login(payload)
      AccessToken.value = res.access_token
    } finally {
      await authenticate()
    }
  }
  async function oauth(provider: string, redirect_url: string) {
    window.location.href = await SSOApi.oauthUrl(provider, redirect_url)
  }

  async function signup(email: string, password: string, first_name: string, last_name: string) {
    try {
      const payload = <UserRegisterRequest>{
        email: email,
        first_name: first_name,
        last_name: last_name,
        password: password,
      }
      const res = await SSOApi.create(payload)
    } finally {
    }
  }

  async function logout() {
    try {
      AccessToken.value = null
      const res = await SSOApi.logout()
    } finally {
    }
  }
  async function refreshToken() {
    try {
      const res = await SSOApi.refresh()
      AccessToken.value = res.access_token
    } finally {
      console.log('refresh')
    }
  }

  async function updateUser(payload: UserUpdateRequest) {
    const updated = await SSOApi.updateUser(payload)
    User.value = <User>{
      email: updated.email,
      email_confirmed: updated.email_confirmed,
      first_name: updated.first_name,
      last_name: updated.last_name,
      locale_type: updated.locale_type,
      photo: updated.photo,
      roles: updated.roles,
    }
  }

  // persist to localStorage
  watch(
    AccessToken,
    (val) => {
      try {
        if (val) localStorage.setItem(STORAGE_KEY, val)
        else localStorage.removeItem(STORAGE_KEY)
      } catch (e) {
        // ignore persistence errors
      }
    },
    { immediate: true },
  )

  return {
    AccessToken,
    isAuthenticated,
    User,
    roles,
    isAdmin,
    isModerator,
    isUserRole,
    isWriterRole,
    login,
    logout,
    signup,
    refreshToken,
    authenticate,
    oauth,
    updateUser,
  }
})
