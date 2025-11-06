<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useToastStore } from '@/stores/toastStore'

const toastStore = useToastStore()
const { message, variant, visible } = storeToRefs(toastStore)

const variantClass = computed(() => `toast-${variant.value}`)
</script>

<template>
  <Teleport to="body">
    <transition name="toast-fade">
      <div v-if="visible" class="toast-container">
        <div class="toast" :class="variantClass">
          <span class="toast-message">{{ message }}</span>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 72px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 150;
  display: flex;
  justify-content: center;
  width: min(460px, calc(100% - 32px));
  pointer-events: none;
}

.toast {
  pointer-events: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px 18px;
  border-radius: var(--radius-lg, 16px);
  background: var(--color-surface, #fff);
  border: 1px solid transparent;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.18);
  color: var(--color-text, #0f172a);
  font-size: 0.95rem;
  line-height: 1.3;
}

.toast.toast-success {
  border-color: color-mix(in oklab, var(--color-primary, #3b82f6), transparent 40%);
  background: color-mix(in oklab, var(--color-primary, #3b82f6), var(--color-bg) 88%);
}

.toast.toast-error {
  border-color: color-mix(in oklab, var(--color-danger, #d14343), transparent 45%);
  background: color-mix(in oklab, var(--color-danger, #d14343), var(--color-bg) 88%);
}

.toast.toast-info {
  border-color: color-mix(in oklab, var(--color-text, #0f172a), transparent 70%);
}

.toast-message {
  margin: 0;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -10px);
}
</style>
