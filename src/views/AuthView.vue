<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
if (authStore.isAuthenticated) {
  router.replace('/')
}
const loginorsignup = ref('login')
const isLogin = computed(() => loginorsignup.value === 'login')
function Switch() {
  console.log('loginorsignup.value: ', loginorsignup.value)
  if (loginorsignup.value == 'login') {
    loginorsignup.value = 'signup'
  } else {
    loginorsignup.value = 'login'
  }
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
</script>
<template>
  <div class="auth-view">
    <div class="card auth-card">
      <div class="login-view">
        <h2 class="auth-title">{{ isLogin ? 'Log in' : 'Sign up' }}</h2>
        <div class="auth-form">
          <input type="email" placeholder="Email" class="input" autocomplete="email" id="email" />
          <input
            type="text"
            placeholder="Lastname"
            class="input"
            autocomplete="family-name"
            id="lastname"
            v-if="!isLogin"
          />
          <input
            type="text"
            placeholder="Firstname"
            class="input"
            autocomplete="given-name"
            id="firstname"
            v-if="!isLogin"
          />
          <input
            type="password"
            placeholder="Password"
            class="input"
            autocomplete="current-password"
            id="password"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            class="input"
            autocomplete="new-password"
            id="confirmpassword"
            v-if="!isLogin"
          />
          <button class="btn btn--primary" @click="onSubmit">
            {{ isLogin ? 'Log in' : 'Sign up' }}
          </button>
          <button class="btn btn-text">Forgot Password?</button>
        </div>
        <div class="oauth">
          <button class="btn oauth-btn">
            <img src="/src/assets/google-icon.svg" alt="Google" class="logo oauth-logo" />
            <span>Continue with Google</span>
          </button>
          <button class="btn oauth-btn">
            <img src="/src/assets/yandex-icon.svg" alt="Yandex" class="logo oauth-logo" />
            <span>Continue with Yandex</span>
          </button>
        </div>
        <div class="switch">
          <span class="muted">{{
            isLogin ? 'Don’t have an account?' : 'Already have an account?'
          }}</span>
          <button class="btn btn-text" @click="Switch()">
            {{ isLogin ? 'Create one' : 'Sign in' }}
          </button>
        </div>
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
</style>
