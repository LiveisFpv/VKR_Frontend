import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastVariant = 'info' | 'success' | 'error'

interface ToastOptions {
  duration?: number
  variant?: ToastVariant
}

export const useToastStore = defineStore('toast', () => {
  const message = ref('')
  const variant = ref<ToastVariant>('info')
  const visible = ref(false)

  let hideTimer: number | null = null

  function clearTimer() {
    if (hideTimer !== null) {
      window.clearTimeout(hideTimer)
      hideTimer = null
    }
  }

  function hide() {
    clearTimer()
    visible.value = false
  }

  function show(nextMessage: string, options: ToastOptions = {}) {
    message.value = nextMessage
    variant.value = options.variant ?? 'info'
    visible.value = true
    clearTimer()
    const duration = options.duration ?? 2500
    if (duration > 0) {
      hideTimer = window.setTimeout(() => {
        hide()
      }, duration)
    }
  }

  return {
    message,
    variant,
    visible,
    show,
    hide,
  }
})
