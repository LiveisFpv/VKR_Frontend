<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useI18n } from '@/i18n'
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const { t } = useI18n()
if (authStore.isAuthenticated) {
  router.replace('/')
}
const loginorsignup = ref('login')
const isLogin = computed(() => loginorsignup.value === 'login')
const isResetSubmitting = ref(false)
const isResetOpen = ref(false)
const resetEmail = ref('')
const resetMessage = ref('')
const resetError = ref('')
function Switch() {
  console.log('loginorsignup.value: ', loginorsignup.value)
  if (loginorsignup.value == 'login') {
    loginorsignup.value = 'signup'
  } else {
    loginorsignup.value = 'login'
  }
}
const openResetDialog = async (e: Event) => {
  e.preventDefault()
  resetMessage.value = ''
  resetError.value = ''
  const emailInput = document.getElementById('email') as HTMLInputElement | null
  resetEmail.value = emailInput?.value?.trim() ?? ''
  isResetOpen.value = true
  await nextTick()
  ;(document.getElementById('reset-email') as HTMLInputElement | null)?.focus()
}
const closeResetDialog = () => {
  if (isResetSubmitting.value) return
  isResetOpen.value = false
  resetMessage.value = ''
  resetError.value = ''
}
const onSubmit = async (e: Event) => {
  e.preventDefault()
  const email = (document.getElementById('email') as HTMLInputElement).value
  const password = (document.getElementById('password') as HTMLInputElement).value
  if (!isLogin.value) {
    const confirmpassword = (document.getElementById('confirmpassword') as HTMLInputElement).value
    const firstname = (document.getElementById('firstname') as HTMLInputElement).value
    const lastname = (document.getElementById('lastname') as HTMLInputElement).value
    await authStore.signup(email, password, firstname, lastname)
    const target = (route.query.redirect as string) || '/'
    router.replace(target)
  }
  if (isLogin.value) {
    await authStore.login(email, password)
    if (authStore.isAuthenticated) {
      const target = (route.query.redirect as string) || '/'
      router.replace(target)
    }
  }
}
const onForgotPassword = async (e?: Event) => {
  e?.preventDefault()
  resetMessage.value = ''
  resetError.value = ''
  const email = resetEmail.value.trim()
  if (!email) {
    resetError.value = t('auth.resetEmailRequired')
    return
  }
  isResetSubmitting.value = true
  try {
    await authStore.requestPasswordReset(email)
    resetMessage.value = t('auth.resetSuccess')
  } catch (error) {
    const fallback = t('auth.resetFailed')
    if (error && typeof error === 'object' && 'message' in error) {
      const errMessage = (error as { message?: string }).message
      resetError.value = errMessage || fallback
    } else {
      resetError.value = fallback
    }
  } finally {
    isResetSubmitting.value = false
  }
}
</script>
<template>
  <div class="auth-view">
    <div class="card auth-card">
      <div class="login-view">
        <h2 class="auth-title">{{ isLogin ? t('auth.login') : t('auth.signup') }}</h2>
        <div class="auth-form">
          <input
            type="email"
            :placeholder="t('auth.email')"
            class="input"
            autocomplete="email"
            id="email"
          />
          <input
            type="text"
            :placeholder="t('auth.lastname')"
            class="input"
            autocomplete="family-name"
            id="lastname"
            v-if="!isLogin"
          />
          <input
            type="text"
            :placeholder="t('auth.firstname')"
            class="input"
            autocomplete="given-name"
            id="firstname"
            v-if="!isLogin"
          />
          <input
            type="password"
            :placeholder="t('auth.password')"
            class="input"
            autocomplete="current-password"
            id="password"
          />
          <input
            type="password"
            :placeholder="t('auth.confirmPassword')"
            class="input"
            autocomplete="new-password"
            id="confirmpassword"
            v-if="!isLogin"
          />
          <button class="btn btn--primary" @click="onSubmit">
            {{ isLogin ? t('auth.login') : t('auth.signup') }}
          </button>
          <button
            class="btn btn-text"
            type="button"
            :disabled="isResetSubmitting"
            @click="openResetDialog"
          >
            {{ t('auth.forgot') }}
          </button>
        </div>
        <div class="oauth">
          <button class="btn oauth-btn" @click="authStore.oauth('google', '/')">
            <img src="/src/assets/google-icon.svg" alt="Google" class="logo oauth-logo" />
            <span>{{ t('auth.continueGoogle') }}</span>
          </button>
          <button class="btn oauth-btn" @click="authStore.oauth('yandex', '/')">
            <img src="/src/assets/yandex-icon.svg" alt="Yandex" class="logo oauth-logo" />
            <span>{{ t('auth.continueYandex') }}</span>
          </button>
        </div>
        <div class="switch">
          <span class="muted">{{ isLogin ? t('auth.noAccount') : t('auth.haveAccount') }}</span>
          <button class="btn btn-text" @click="Switch()">
            {{ isLogin ? t('auth.createOne') : t('auth.signIn') }}
          </button>
        </div>
      </div>
    </div>
    <div v-if="isResetOpen" class="reset-modal-overlay" @click.self="closeResetDialog">
      <div class="reset-modal" role="dialog" aria-modal="true">
        <h3 class="reset-title">{{ t('auth.resetTitle') }}</h3>
        <p class="reset-description">{{ t('auth.resetDescription') }}</p>
        <form class="reset-form" @submit.prevent="onForgotPassword()">
          <label class="reset-label" for="reset-email">{{ t('auth.email') }}</label>
          <input
            id="reset-email"
            v-model="resetEmail"
            type="email"
            class="input"
            :placeholder="t('auth.email')"
            autocomplete="email"
            required
          />
          <p v-if="resetMessage" class="reset-feedback reset-feedback--success">
            {{ resetMessage }}
          </p>
          <p v-if="resetError" class="reset-feedback reset-feedback--error">
            {{ resetError }}
          </p>
          <div class="reset-actions">
            <button
              class="btn"
              type="button"
              :disabled="isResetSubmitting"
              @click="closeResetDialog"
            >
              {{ resetMessage ? t('auth.resetClose') : t('auth.resetCancel') }}
            </button>
            <button class="btn btn--primary" type="submit" :disabled="isResetSubmitting">
              {{ isResetSubmitting ? t('common.loading') : t('auth.resetSubmit') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
<style lang="css" scoped>
.auth-view {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: var(--space-8) var(--space-4);
}

.auth-card {
  width: 100%;
  max-width: 440px;
  padding: var(--space-6);
  display: grid;
  gap: var(--space-6);
}

.login-view,
.signup-view {
  display: grid;
  gap: var(--space-6);
}

.auth-title {
  text-align: center;
  margin: 0;
}

.auth-form {
  display: grid;
  gap: var(--space-3);
}

.btn-text {
  background: transparent;
  border: 1px solid transparent;
  color: var(--color-primary);
  padding: 0;
}
.btn-text:hover {
  text-decoration: underline;
  background: transparent;
}

.oauth {
  display: grid;
  gap: var(--space-3);
}

.oauth-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  justify-content: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  line-height: 1.2;
}

.oauth-btn:hover {
  background: color-mix(in oklab, var(--color-surface), var(--color-text) 3%);
  border-color: var(--color-border);
}

.oauth-logo {
  filter: none !important;
  width: 1.2em;
  height: 1.2em;
  flex-shrink: 0;
}

.oauth-btn span {
  line-height: 1.2;
  white-space: nowrap;
}

.switch {
  display: flex;
  gap: var(--space-2);
  align-items: baseline;
  justify-content: center;
}

.btn-text {
  line-height: 1.2;
  display: inline-flex;
  align-items: baseline;
}

.reset-feedback {
  font-size: 0.875rem;
  margin: 0;
}

.reset-feedback--success {
  color: var(--color-success, #10b981);
}

.reset-feedback--error {
  color: var(--color-danger, #ef4444);
}

.reset-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  display: grid;
  place-items: center;
  padding: var(--space-4);
  z-index: 1000;
}

.reset-modal {
  background: var(--color-surface);
  color: var(--color-text);
  border-radius: var(--radius-md);
  padding: var(--space-6);
  box-shadow: var(--shadow-md);
  width: min(420px, 100%);
  display: grid;
  gap: var(--space-3);
}

.reset-title {
  margin: 0;
}

.reset-description {
  margin: 0;
  color: var(--color-muted);
}

.reset-form {
  display: grid;
  gap: var(--space-3);
}

.reset-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.reset-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
}
</style>
