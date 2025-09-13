import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useAuthStore } from '@/stores/authStore'

import './assets/main.css'
import './assets/theme.css'

import App from './App.vue'
import router from './router'

// Theme initialization with persistence
const THEME_KEY = 'theme'
type Theme = 'light' | 'dark'

function readSavedTheme(): Theme | null {
  try {
    const t = localStorage.getItem(THEME_KEY)
    return t === 'light' || t === 'dark' ? t : null
  } catch {
    return null
  }
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
}

function setTheme(theme: Theme) {
  applyTheme(theme)
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {}
}

function toggleTheme() {
  const next: Theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
  setTheme(next)
}

// Initialize theme (default to dark)
applyTheme(readSavedTheme() ?? 'dark')

// Expose helpers globally
;(window as any).__setTheme = setTheme
;(window as any).__toggleTheme = toggleTheme

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(router)

// Auth bootstrap: refresh token and load user on app start
try {
  const auth = useAuthStore(pinia)
  await auth.authenticate()
} catch {
  // ignore bootstrap auth errors; user stays logged out
}

app.mount('#app')
