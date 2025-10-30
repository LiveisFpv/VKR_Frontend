<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import UpTab from '@/components/UpTab.vue'
import LeftTab from '@/components/LeftTab.vue'
import { SSOApi } from '@/api/useSSOApi'
import type { UserResponse } from '@/api/types'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
const router = useRouter()

const loading = ref(false)
const errorMsg = ref('')
const users = reactive<UserResponse[]>([])

onMounted(async () => {
  await loadUsers()
})

async function loadUsers() {
  errorMsg.value = ''
  loading.value = true
  try {
    const res = await SSOApi.getUsers()
    users.splice(0, users.length, ...res)
  } catch (e: any) {
    errorMsg.value = e?.message || 'Failed to fetch users'
  } finally {
    loading.value = false
  }
}

function goModerator() {
  router.push('/moderator')
}

type UserEditing = UserResponse & { _editing?: boolean; rolesString?: string }

function startEdit(u: UserEditing) {
  u._editing = true
  u.rolesString = u.roles?.join(', ') || ''
}
function cancelEdit(u: UserEditing) {
  u._editing = false
}
async function saveUser(u: UserEditing) {
  // Placeholder: no admin update endpoint in types; keep local only
  if (typeof u.rolesString === 'string') {
    u.roles = u.rolesString
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean)
  }
  u._editing = false
}
</script>

<template>
  <UpTab :show-menu="false" :show-upload="false" />
  <LeftTab :hidden="true" />

  <div class="area" :class="{ collapsed: true }">
    <div class="container">
      <div class="row">
        <h2>Admin Panel</h2>
        <button class="btn" @click="goModerator">Moderator Panel</button>
      </div>

      <div class="panel">
        <div class="row">
          <h3>Users</h3>
          <button class="btn" @click="loadUsers" :disabled="loading">Refresh</button>
        </div>
        <p class="muted" v-if="loading">Loading…</p>
        <p class="err" v-else-if="errorMsg">{{ errorMsg }}</p>
        <div class="table" v-else>
          <div class="thead">
            <div>Email</div>
            <div>First name</div>
            <div>Last name</div>
            <div>Roles</div>
            <div></div>
          </div>
          <div class="rowdata" v-for="u in users as UserEditing[]" :key="u.email">
            <div>{{ u.email }}</div>
            <div>
              <template v-if="!u._editing">{{ u.first_name }}</template>
              <input v-else type="text" v-model="u.first_name" />
            </div>
            <div>
              <template v-if="!u._editing">{{ u.last_name }}</template>
              <input v-else type="text" v-model="u.last_name" />
            </div>
            <div>
              <template v-if="!u._editing">{{ u.roles?.join(', ') }}</template>
              <input
                v-else
                type="text"
                v-model="u.rolesString"
                placeholder="USER,MODERATOR,ADMIN"
              />
            </div>
            <div class="actions">
              <button class="btn" v-if="!u._editing" @click="startEdit(u)">Edit</button>
              <template v-else>
                <button class="btn" @click="cancelEdit(u)">Cancel</button>
                <button class="btn primary" @click="saveUser(u)">Save</button>
              </template>
            </div>
          </div>
        </div>
        <p class="muted" v-if="!loading && !errorMsg && users.length === 0">No users</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.area {
  position: fixed;
  inset: 60px 20px 20px 310px;
  transition: all var(--transition-slow) ease;
}
.area.collapsed {
  inset: 60px 20px 20px 120px;
}
.container {
  max-width: 1100px;
  margin: auto;
  display: grid;
  gap: var(--space-5);
}
.row {
  display: flex;
  gap: var(--space-2);
  align-items: center;
  justify-content: space-between;
}
.panel {
  display: grid;
  gap: var(--space-3);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: var(--space-3);
}
.muted {
  color: var(--color-muted);
  margin: 0;
}
.err {
  color: var(--color-danger);
}
.table {
  display: grid;
  gap: 8px;
}
.thead,
.rowdata {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr auto;
  gap: 8px;
  align-items: center;
}
.thead {
  font-weight: 600;
  color: var(--color-muted);
}
input[type='text'] {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-surface);
  color: var(--color-text);
}
.actions {
  display: inline-flex;
  gap: 8px;
  justify-content: flex-end;
}
.btn {
  border: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
  padding: 6px 12px;
  border-radius: 6px;
}
.btn.primary {
  background: var(--color-primary-secondary);
  border-color: var(--color-primary-secondary);
  color: #fff;
}
</style>
