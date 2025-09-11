import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
export const useAuthStore = defineStore('auth', () => {
  const STORAGE_KEY = 'auth.access_token'
  let initial: string | null = null
  try {
    initial = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
  } catch (e) {
    initial = null
  }
  const AccessToken = ref<string | null>(null) // ! Replace to initial
  const isAuthenticated = computed(() => !!AccessToken.value)

  //! TODO: Implement login, logout, and token refresh functions

  function login(email: string, password: string) {
    AccessToken.value = 'dummy_token'
    return true
  }

  function signup(email: string, password: string, first_name: string, last_name: string) {
    return true
  }

  function logout() {
    AccessToken.value = null
  }
  function refreshToken() {}

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
