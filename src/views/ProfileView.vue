<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import LeftTab from '@/components/LeftTab.vue'
import UpTab from '@/components/UpTab.vue'
import { useAuthStore } from '@/stores/authStore'
import { useSettingStore } from '@/stores/settingStore'
import type { UserUpdateRequest } from '@/api/types'

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

// Edit form state
const form = reactive({
  email: '',
  first_name: '',
  last_name: '',
  locale_type: '',
  password: '', // optional, leave blank to keep
})

const editing = ref(false)
const saving = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

// Sync form with store user
watch(
  () => auth.User,
  (u) => {
    if (!u) return
    form.email = u.email || ''
    form.first_name = u.first_name || ''
    form.last_name = u.last_name || ''
    form.locale_type = u.locale_type || ''
    form.password = ''
  },
  { immediate: true },
)

function resetFormFromUser() {
  const u = auth.User
  if (!u) return
  form.email = u.email || ''
  form.first_name = u.first_name || ''
  form.last_name = u.last_name || ''
  form.locale_type = u.locale_type || ''
  form.password = ''
}

function startEditing() {
  successMsg.value = ''
  errorMsg.value = ''
  resetFormFromUser()
  editing.value = true
}

function cancelEditing() {
  successMsg.value = ''
  errorMsg.value = ''
  resetFormFromUser()
  editing.value = false
}

function buildPayload(): UserUpdateRequest {
  const u = auth.User
  const payload: UserUpdateRequest = {}
  if (u) {
    if (form.email && form.email !== u.email) payload.email = form.email
    if (form.first_name !== u.first_name) payload.first_name = form.first_name
    if (form.last_name !== u.last_name) payload.last_name = form.last_name
    if ((form.locale_type || '') !== (u.locale_type || ''))
      payload.locale_type = form.locale_type || undefined
  } else {
    // If user not loaded, send non-empty fields
    if (form.email) payload.email = form.email
    if (form.first_name) payload.first_name = form.first_name
    if (form.last_name) payload.last_name = form.last_name
    if (form.locale_type) payload.locale_type = form.locale_type
  }
  if (form.password) payload.password = form.password
  return payload
}

async function saveProfile() {
  successMsg.value = ''
  errorMsg.value = ''
  const payload = buildPayload()
  if (!Object.keys(payload).length) {
    successMsg.value = 'Nothing to update'
    return
  }
  try {
    saving.value = true
    await auth.updateUser(payload)
    successMsg.value = 'Profile updated'
  } catch (e: any) {
    errorMsg.value = e?.message || 'Failed to update profile'
  } finally {
    saving.value = false
  }
}
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

        <div class="meta" v-if="!editing">
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

        <div v-if="editing" class="editor">
          <h3>Edit profile</h3>
          <div class="grid">
            <label>
              <span>Email</span>
              <input v-model="form.email" type="email" placeholder="Email" />
            </label>
            <label>
              <span>First name</span>
              <input v-model="form.first_name" type="text" placeholder="First name" />
            </label>
            <label>
              <span>Last name</span>
              <input v-model="form.last_name" type="text" placeholder="Last name" />
            </label>
            <label>
              <span>Locale</span>
              <input v-model="form.locale_type" type="text" placeholder="Locale (e.g. en, ru)" />
            </label>
            <label>
              <span>New password</span>
              <input v-model="form.password" type="password" placeholder="Leave blank to keep" />
            </label>
          </div>
          <div class="feedback">
            <span v-if="successMsg" class="ok">{{ successMsg }}</span>
            <span v-if="errorMsg" class="err">{{ errorMsg }}</span>
          </div>
          <div class="actions">
            <button class="btn" :disabled="saving" @click="cancelEditing">Cancel</button>
            <button class="btn btn--primary" :disabled="saving" @click="saveProfile">
              {{ saving ? 'Saving...' : 'Save changes' }}
            </button>
          </div>
        </div>

        <div class="actions" v-if="!editing">
          <button class="btn" @click="startEditing">Edit profile</button>
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

.editor {
  display: grid;
  gap: var(--space-3);
  padding-top: var(--space-4);
  border-top: 1px dashed var(--color-border);
}
.editor h3 {
  margin: 0;
}
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}
label {
  display: grid;
  gap: 6px;
}
label span {
  color: var(--color-muted);
  font-size: 0.9rem;
}
input[type='text'],
input[type='email'],
input[type='password'] {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-surface);
  color: var(--color-text);
}
.feedback {
  min-height: 1.25rem;
}
.feedback .ok {
  color: var(--color-success);
}
.feedback .err {
  color: var(--color-danger);
}

.actions {
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
}
</style>
