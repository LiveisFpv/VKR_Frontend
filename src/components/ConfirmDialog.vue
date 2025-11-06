<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    message?: string
    confirmText?: string
    cancelText?: string
    closeOnBackdrop?: boolean
  }>(),
  {
    title: '',
    message: '',
    confirmText: 'OK',
    cancelText: 'Cancel',
    closeOnBackdrop: true,
  },
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
  (event: 'confirm'): void
  (event: 'cancel'): void
}>()

const confirmButtonRef = ref<HTMLButtonElement | null>(null)
const uid = Math.random().toString(36).slice(2, 8)
let previouslyFocused: HTMLElement | null = null

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined'

function closeAndEmitCancel() {
  emit('cancel')
  emit('update:modelValue', false)
}

function handleCancel() {
  closeAndEmitCancel()
}

function handleConfirm() {
  emit('confirm')
  emit('update:modelValue', false)
}

function handleOverlayClick(event: MouseEvent) {
  if (!props.closeOnBackdrop) return
  if (event.target === event.currentTarget) {
    closeAndEmitCancel()
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (!props.modelValue) return
  if (event.key === 'Escape') {
    event.preventDefault()
    closeAndEmitCancel()
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (!isBrowser) return
    if (open) {
      previouslyFocused = document.activeElement as HTMLElement | null
      document.addEventListener('keydown', handleKeydown)
      nextTick(() => {
        confirmButtonRef.value?.focus()
      })
    } else {
      document.removeEventListener('keydown', handleKeydown)
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus()
      }
      previouslyFocused = null
    }
  },
  { immediate: false },
)

onBeforeUnmount(() => {
  if (!isBrowser) return
  document.removeEventListener('keydown', handleKeydown)
})

const titleId = computed(() => (props.title ? `confirm-dialog-title-${uid}` : undefined))
const bodyId = computed(() => (props.message ? `confirm-dialog-body-${uid}` : undefined))
</script>

<template>
  <Teleport to="body">
    <transition name="confirm-fade">
      <div
        v-if="modelValue"
        class="confirm-overlay"
        role="presentation"
        @click="handleOverlayClick"
      >
        <div
          class="confirm-modal"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          :aria-describedby="bodyId"
        >
          <header v-if="title" class="confirm-header">
            <h3 class="confirm-title" :id="titleId">{{ title }}</h3>
          </header>
          <div class="confirm-body" :id="bodyId">
            <slot>
              <p v-if="message">{{ message }}</p>
            </slot>
          </div>
          <footer class="confirm-actions">
            <button type="button" class="btn btn-secondary" @click="handleCancel">
              {{ cancelText }}
            </button>
            <button
              ref="confirmButtonRef"
              type="button"
              class="btn btn-primary"
              @click="handleConfirm"
            >
              {{ confirmText }}
            </button>
          </footer>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.35);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  z-index: 200;
}

.confirm-modal {
  min-width: min(360px, 90vw);
  max-width: 95vw;
  background: var(--color-surface, #ffffff);
  border-radius: var(--radius-lg, 16px);
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.18);
  border: 1px solid var(--color-border, rgba(148, 163, 184, 0.35));
  padding: 20px 24px;
  color: var(--color-text, #0f172a);
}

.confirm-header {
  margin-bottom: 12px;
}

.confirm-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.confirm-body {
  margin-bottom: 20px;
  font-size: 0.95rem;
  line-height: 1.4;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md, 12px);
  font-size: 0.9rem;
  line-height: 1.2;
  border: 1px solid transparent;
  cursor: pointer;
  transition:
    background var(--transition-base, 0.2s ease),
    color var(--transition-base, 0.2s ease),
    border-color var(--transition-base, 0.2s ease),
    transform var(--transition-fast, 0.1s ease);
}

.btn-secondary {
  background: color-mix(in srgb, var(--color-surface, #ffffff), var(--color-text, #0f172a) 6%);
  color: var(--color-text, #0f172a);
  border-color: transparent;
}

.btn-secondary:hover {
  background: color-mix(in srgb, var(--color-surface, #ffffff), var(--color-text, #0f172a) 11%);
}

.btn-primary {
  background: var(--color-danger, #d14343);
  color: #ffffff;
}

.btn-primary:hover {
  background: color-mix(in srgb, var(--color-danger, #d14343), #000000 8%);
}

.btn:active {
  transform: translateY(1px);
}

.confirm-fade-enter-active,
.confirm-fade-leave-active {
  transition: opacity 0.2s ease;
}

.confirm-fade-enter-from,
.confirm-fade-leave-to {
  opacity: 0;
}
</style>
