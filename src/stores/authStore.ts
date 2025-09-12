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

  async function login(email: string, password: string) {
    try {
      const payload = <UserLoginRequest>{
        login: email,
        password: password,
      }
      const res = await SSOApi.login(payload)
      AccessToken.value = res.access_token
    } finally {
      const userRes = await SSOApi.authenticate()
      User.value = <User>{
        email: userRes.email,
        email_confirmed: userRes.email_confirmed,
        first_name: userRes.first_name,
        last_name: userRes.last_name,
        locale_type: userRes.locale_type,
        photo: userRes.photo,
        roles: userRes.roles,
      }
    }
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
      const res = await SSOApi.logout()
    } finally {
      AccessToken.value = null
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

  return { AccessToken, isAuthenticated, login, logout, signup, refreshToken }
})
