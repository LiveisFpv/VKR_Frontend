<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useSettingStore } from '@/stores/settingStore'
const authStore = useAuthStore()
const router = useRouter()
function RedirecttoProfile() {
  router.push('/profile')
}
function RedirecttoAuth() {
  router.push('/auth')
}
const useSetting = useSettingStore()
</script>
<template>
  <div class="up-tab" :class="{ collapsed: useSetting.LeftTabHidden }">
    <img class="logo" src="/src/assets/logo.svg" style="width: auto; height: 40px" />
    <div class="button-group">
      <button class="btn avatar" @click="RedirecttoProfile" v-if="authStore.isAuthenticated">
        U
      </button>
      <button class="btn btn-icon"><img class="logo" src="/src/assets/upload-icon.svg" /></button>
      <button class="btn btn-icon">&ctdot;</button>
      <button class="btn btn-icon" @click="RedirecttoAuth" v-if="!authStore.isAuthenticated">
        Login
      </button>
    </div>
  </div>
</template>
<style lang="css" scoped>
.up-tab {
  position: fixed;
  display: inline-flex;
  align-items: center;
  top: 0;
  left: 310px;
  right: 0;
  height: 60px;
  background-color: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
  border-left: 1px solid var(--color-border);
  border-bottom-left-radius: 30px;
  padding: 10px 20px;
  transition: all var(--transition-slow) ease;
}
.up-tab.collapsed {
  left: 120px;
}
.btn.btn-icon {
  min-width: 50px;
  height: 40px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-bg-secondary);
  background: var(--color-bg-secondary);
  color: var(--color-text);
  border-radius: var(--radius-md);
  line-height: 1;
  font-size: medium;
}
.btn.btn-icon:hover {
  border-color: var(--color-border);
  background: color-mix(in oklab, var(--color-surface), var(--color-text) 3%);
}
.btn.btn-icon:active {
  transform: translateY(1px);
}
.btn-icon .logo {
  width: 1.2em;
  height: 1.2em;
}
.btn.avatar {
  width: 40px;
  height: 40px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-primary-secondary);
  background: var(--color-surface);
  color: var(--color-text);
  border-radius: 50%;
  font-weight: 600;
  font-size: 1em;
  line-height: 1;
}
.btn.avatar:hover {
  border-color: var(--color-primary);
  background: color-mix(in oklab, var(--color-surface), var(--color-primary) 5%);
  color: var(--color-primary);
}

.button-group {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.up-tab h3 {
  margin: 0;
  line-height: 1.2;
  color: var(--color-text-primary);
}
</style>
