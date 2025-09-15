<script setup lang="ts">
import { computed, onMounted } from 'vue'
import LeftTab from '@/components/LeftTab.vue'
import UpTab from '@/components/UpTab.vue'
import { useAuthStore } from '@/stores/authStore'
import { useSettingStore } from '@/stores/settingStore'

const auth = useAuthStore()
const useSetting = useSettingStore()

onMounted(async () => {
  if (auth.isAuthenticated && !auth.User) {
    try {
      await auth.authenticate()
    } catch {}
  }
})

const fullName = computed(() => {
  const u = auth.User
  if (!u) return ''
  return [u.first_name, u.last_name].filter(Boolean).join(' ')
})

const avatarLetter = computed(() => {
  const u = auth.User
  if (!u) return 'U'
  const src = [u.first_name, u.last_name].filter(Boolean).join(' ')
  return src ? (src.trim()[0]?.toUpperCase() ?? 'U') : 'U'
})
</script>

<template>
  <UpTab :show-menu="false" :show-upload="false" />
  <LeftTab :hidden="true" />

  <div class="profile-area" :class="{ collapsed: useSetting.LeftTabHidden }">
    <div class="container">
      <div class="card profile-card">
        <div class="profile-header">
          <div class="avatar" aria-hidden="true">
            <span>{{ avatarLetter }}</span>
          </div>
          <div class="identity">
            <h2 class="name">{{ fullName || 'Your profile' }}</h2>
            <p class="muted" v-if="auth.User?.email">{{ auth.User?.email }}</p>
          </div>
        </div>

        <div class="meta">
          <div class="row">
            <span class="label">Email confirmed</span>
            <span
              class="value"
              :class="{ ok: auth.User?.email_confirmed, warn: !auth.User?.email_confirmed }"
            >
              {{ auth.User?.email_confirmed ? 'Yes' : 'No' }}
            </span>
          </div>
          <div class="row" v-if="auth.User?.locale_type">
            <span class="label">Locale</span>
            <span class="value">{{ auth.User?.locale_type }}</span>
          </div>
          <div class="row" v-if="auth.User?.roles?.length">
            <span class="label">Roles</span>
            <span class="value roles">
              <span v-for="r in auth.User?.roles" :key="r" class="chip">{{ r }}</span>
            </span>
          </div>
        </div>

        <div class="actions">
          <button class="btn" @click="$router.push('/settings')">Settings</button>
          <button
            class="btn btn--primary"
            @click="auth.logout().then(() => $router.replace('/auth'))"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.profile-area {
  position: fixed;
  inset: 60px 20px 20px 310px;
  display: grid;
  align-items: start;
  transition: all var(--transition-slow) ease;
}

.profile-area.collapsed {
  inset: 60px 20px 20px 120px;
}

.container {
  max-width: 500px;
  margin: auto;
}

.profile-card {
  display: grid;
  gap: var(--space-6);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 2px solid var(--color-primary-secondary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  background: var(--color-surface);
}
.avatar span {
  font-size: 1.5rem;
}

.identity .name {
  margin: 0;
}

.meta {
  display: grid;
  gap: var(--space-3);
}
.row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 1px dashed var(--color-border);
  padding-bottom: 6px;
}
.label {
  color: var(--color-muted);
}
.value.ok {
  color: var(--color-success);
}
.value.warn {
  color: var(--color-danger);
}
.roles {
  display: inline-flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.actions {
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
}
</style>
