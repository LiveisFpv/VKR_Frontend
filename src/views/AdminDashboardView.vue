<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import UpTab from '@/components/UpTab.vue'
import LeftTab from '@/components/LeftTab.vue'
import { SSOApi } from '@/api/useSSOApi'
import type { UserResponse, UserListResponse, UserUpdateRequest } from '@/api/types'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useI18n } from '@/i18n'

const auth = useAuthStore()
const router = useRouter()
const { t } = useI18n()

const loading = ref(false)
const errorMsg = ref('')
const users = reactive<UserResponse[]>([])
const total = ref(0)
const page = ref(1)
const limit = ref(20)

const filters = reactive({
  q: '',
  role: '',
  locale: '',
  email_confirmed: '' as '' | 'true' | 'false',
})

const params = computed(() => ({
  q: filters.q || undefined,
  role: filters.role || undefined,
  locale: filters.locale || undefined,
  email_confirmed:
    filters.email_confirmed === '' ? undefined : filters.email_confirmed === 'true' ? true : false,
  page: page.value,
  limit: limit.value,
}))

onMounted(async () => {
  await loadUsers()
})

async function loadUsers() {
  errorMsg.value = ''
  loading.value = true
  try {
    const res = (await SSOApi.getUsers(params.value)) as UserListResponse
    users.splice(0, users.length, ...((res?.items ?? []) as UserResponse[]))
    total.value = res?.total ?? 0
    page.value = res?.page ?? page.value
    limit.value = res?.limit ?? limit.value
  } catch (e: any) {
    errorMsg.value = e?.message || t('admin.errFetch')
  } finally {
    loading.value = false
  }
}

function goModerator() {
  router.push('/moderator')
}

type UserEditing = UserResponse & {
  _editing?: boolean
  rolesString?: string
  _password?: string
  _saving?: boolean
  _error?: string
}

function startEdit(u: UserEditing) {
  u._editing = true
  u.rolesString = u.roles?.join(', ') || ''
  u._password = ''
}
function cancelEdit(u: UserEditing) {
  u._editing = false
}
async function saveUser(u: UserEditing) {
  u._error = ''
  u._saving = true
  try {
    // roles editing stays local until backend supports it explicitly
    if (typeof u.rolesString === 'string') {
      u.roles = u.rolesString
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean)
    }
    const payload: UserUpdateRequest = {}
    if (u.first_name) payload.first_name = u.first_name
    if (u.last_name) payload.last_name = u.last_name
    if (u.locale_type) payload.locale_type = u.locale_type
    if (u._password) payload.password = u._password
    // Use existing PUT endpoint
    const updated = await SSOApi.updateUser(payload)
    // reflect returned fields
    u.first_name = updated.first_name
    u.last_name = updated.last_name
    u.locale_type = updated.locale_type
    u.photo = updated.photo
    u.email_confirmed = updated.email_confirmed
    u.roles = updated.roles
    u._editing = false
  } catch (e: any) {
    u._error = e?.message || 'Failed to save user'
  } finally {
    u._saving = false
  }
}

function applyFilters() {
  page.value = 1
  loadUsers()
}
function resetFilters() {
  filters.q = ''
  filters.role = ''
  filters.locale = ''
  filters.email_confirmed = ''
  page.value = 1
  loadUsers()
}
function prevPage() {
  if (page.value > 1) {
    page.value -= 1
    loadUsers()
  }
}
function nextPage() {
  const pages = Math.max(1, Math.ceil(total.value / limit.value))
  if (page.value < pages) {
    page.value += 1
    loadUsers()
  }
}
function changeLimit(val: number) {
  limit.value = val
  page.value = 1
  loadUsers()
}
</script>

<template>
  <UpTab :show-menu="false" :show-upload="false" />
  <LeftTab :hidden="true" />

  <div class="area" :class="{ collapsed: true }">
    <div class="container">
      <div class="row">
        <h2>{{ t('admin.title') }}</h2>
        <button class="btn" @click="goModerator">{{ t('admin.toModerator') }}</button>
      </div>

      <div class="panel">
        <div class="filters">
          <input type="text" v-model="filters.q" :placeholder="t('admin.filters.search')" />
          <input type="text" v-model="filters.role" :placeholder="t('admin.filters.role')" />
          <input type="text" v-model="filters.locale" :placeholder="t('admin.filters.locale')" />
          <select v-model="filters.email_confirmed">
            <option value="">{{ t('common.no') }}/{{ t('common.yes') }} any</option>
            <option value="true">{{ t('common.yes') }}</option>
            <option value="false">{{ t('common.no') }}</option>
          </select>
          <select
            :value="limit"
            @change="changeLimit(parseInt(($event.target as HTMLSelectElement).value))"
          >
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
          </select>
          <button class="btn" @click="applyFilters">{{ t('admin.filters.apply') }}</button>
          <button class="btn" @click="resetFilters">{{ t('admin.filters.reset') }}</button>
        </div>
        <div class="row">
          <h3>{{ t('admin.users') }}</h3>
          <button class="btn" @click="loadUsers" :disabled="loading">
            {{ t('common.refresh') }}
          </button>
        </div>
        <p class="muted" v-if="loading">{{ t('common.loading') }}</p>
        <p class="err" v-else-if="errorMsg">{{ errorMsg }}</p>
        <div class="table" v-else>
          <div class="thead">
            <div>{{ t('admin.columns.email') }}</div>
            <div>{{ t('admin.columns.first') }}</div>
            <div>{{ t('admin.columns.last') }}</div>
            <div>{{ t('admin.columns.locale') }}</div>
            <div>{{ t('admin.columns.confirmed') }}</div>
            <div>{{ t('admin.columns.roles') }}</div>
            <div>{{ t('admin.columns.password') }}</div>
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
              <template v-if="!u._editing">{{ u.locale_type }}</template>
              <input v-else type="text" v-model="u.locale_type" />
            </div>
            <div>
              <span :class="['chip', u.email_confirmed ? 'ok' : 'warn']">
                {{ u.email_confirmed ? t('common.yes') : t('common.no') }}
              </span>
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
            <div>
              <template v-if="!u._editing">—</template>
              <input v-else type="password" v-model="(u as any)._password" placeholder="******" />
            </div>
            <div class="actions">
              <button class="btn" v-if="!u._editing" @click="startEdit(u)">
                {{ t('common.edit') }}
              </button>
              <template v-else>
                <button class="btn" @click="cancelEdit(u)">{{ t('common.cancel') }}</button>
                <button class="btn primary" @click="saveUser(u)">{{ t('common.save') }}</button>
              </template>
            </div>
          </div>
        </div>
        <p class="muted" v-if="!loading && !errorMsg && users.length === 0">
          {{ t('admin.noUsers') }}
        </p>
        <div class="pager" v-if="!loading && total > 0">
          <button class="btn" @click="prevPage" :disabled="page <= 1">
            {{ t('admin.pager.prev') }}
          </button>
          <span class="muted">
            {{
              t('admin.pager.pageOf')
                .replace('{page}', String(page))
                .replace('{pages}', String(Math.max(1, Math.ceil(total / limit))))
            }}
            {{ t('admin.pager.total').replace('{total}', String(total)) }}
          </span>
          <button
            class="btn"
            @click="nextPage"
            :disabled="page >= Math.max(1, Math.ceil(total / limit))"
          >
            {{ t('admin.pager.next') }}
          </button>
        </div>
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
.filters {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto auto auto;
  gap: 8px;
  align-items: center;
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
  grid-template-columns: 2fr 1fr 1fr 0.8fr 0.8fr 0.8fr 1.5fr 1.2fr auto;
  gap: 8px;
  align-items: center;
}
.thead {
  font-weight: 600;
  color: var(--color-muted);
}
input[type='text'],
input[type='password'],
select {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-surface);
  color: var(--color-text);
}
.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--color-border);
}
.chip {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.8rem;
  border: 1px solid var(--color-border);
}
.chip.ok {
  background: color-mix(in oklab, var(--color-success), var(--color-bg) 85%);
}
.chip.warn {
  background: color-mix(in oklab, var(--color-danger), var(--color-bg) 85%);
}
.actions {
  display: inline-flex;
  gap: 8px;
  justify-content: flex-end;
}
.pager {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: flex-end;
}
</style>
