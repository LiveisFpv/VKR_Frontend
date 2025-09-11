import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
export const useAuthStore = defineStore('auth', () => {
  const AccessToken = ref<string | null>(null)
  const isAuthenticated = computed(() => !!AccessToken.value)

  //! TODO: Implement login, logout, and token refresh functions

  return { AccessToken, isAuthenticated }
})
