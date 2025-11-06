<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UpTab from '@/components/UpTab.vue'
import LeftTab from '@/components/LeftTab.vue'
import { usePaperStore, type PaperStatus } from '@/stores/paperStore'
import { locale, useI18n } from '@/i18n'
import { useLayoutInset } from '@/composables/useLayoutInset'

type Related = { id: string }
type Referenced = { id: string }

const route = useRoute()
const router = useRouter()
const paperStore = usePaperStore()
const { LeftTabHidden: leftHidden, layoutInset } = useLayoutInset()
const { t } = useI18n()
const currentId = computed(() => String(route.params.id || ''))
const loading = ref(false)
const saving = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

const statusKeyMap: Record<PaperStatus, string> = {
  DRAFT: 'papers.status.draft',
  PENDING: 'papers.status.pending',
  REJECTED: 'papers.status.rejected',
  APPROVED: 'papers.status.approved',
}

const form = reactive({
  title: '',
  abstract: '',
  year: undefined as number | undefined,
  best_oa_location: '',
  related_paper: [] as Related[],
  referenced_paper: [] as Referenced[],
})

const paper = computed(() => paperStore.getById(currentId.value))
const canEdit = computed(() => (paper.value ? paperStore.canEdit(paper.value.id) : false))
const statusLabel = computed(() => {
  const status = paper.value?.status ?? 'DRAFT'
  return t(statusKeyMap[status])
})

watch(
  () => paper.value,
  (value) => {
    if (!value) return
    form.title = value.title
    form.abstract = value.abstract || ''
    form.year = value.year
    form.best_oa_location = value.best_oa_location || ''
    form.related_paper = value.related_paper?.map((item) => ({ id: item.id || '' })) ?? []
    form.referenced_paper = value.referenced_paper?.map((item) => ({ id: item.id || '' })) ?? []
  },
  { immediate: true },
)

async function ensureLoaded() {
  if (paper.value) return
  loading.value = true
  try {
    await paperStore.loadMyPapers()
  } finally {
    loading.value = false
  }
}

void ensureLoaded()

function statusTone(status: PaperStatus | undefined) {
  switch (status) {
    case 'APPROVED':
      return 'success'
    case 'REJECTED':
      return 'danger'
    case 'PENDING':
      return 'warning'
    default:
      return 'info'
  }
}

function formatDate(value?: string) {
  if (!value) return '--'
  try {
    const dt = new Date(value)
    return new Intl.DateTimeFormat(locale.value, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dt)
  } catch {
    return value
  }
}

function addRelated() {
  form.related_paper.push({ id: '' })
}
function removeRelated(index: number) {
  form.related_paper.splice(index, 1)
}
function addReferenced() {
  form.referenced_paper.push({ id: '' })
}
function removeReferenced(index: number) {
  form.referenced_paper.splice(index, 1)
}

async function submit() {
  successMsg.value = ''
  errorMsg.value = ''
  if (!paper.value) {
    errorMsg.value = t('papers.errNotFound')
    return
  }
  if (!canEdit.value) {
    errorMsg.value = t('papers.errNotEditable')
    return
  }
  if (!form.title.trim()) {
    errorMsg.value = t('paperAdd.errNoTitle')
    return
  }
  try {
    saving.value = true
    await paperStore.savePaper({
      id: paper.value.id,
      title: form.title.trim(),
      abstract: form.abstract.trim() || undefined,
      year: form.year,
      best_oa_location: form.best_oa_location.trim() || undefined,
      related_paper: form.related_paper
        .filter((item) => item.id.trim())
        .map((item) => ({ id: item.id.trim() })),
      referenced_paper: form.referenced_paper
        .filter((item) => item.id.trim())
        .map((item) => ({ id: item.id.trim() })),
      status: paper.value.status,
      moderatorComment: paper.value.moderatorComment,
    })
    successMsg.value = t('papers.okSaved')
  } catch (e: any) {
    errorMsg.value = e?.message || t('papers.errSave')
  } finally {
    saving.value = false
  }
}

function goBack() {
  router.back()
}
</script>

<template>
  <UpTab :show-menu="false" :show-upload="false" />
  <LeftTab />
  <div class="area" :class="{ collapsed: leftHidden }" :style="{ '--layout-inset': layoutInset }">
    <div class="container">
      <template v-if="paper">
        <header class="head">
          <div>
            <h2>{{ t('paperEdit.title') }}</h2>
            <p class="muted">
              {{ t('paperEdit.statusLabel') }}
              <span class="status" :class="statusTone(paper.status)">{{ statusLabel }}</span>
            </p>
            <p class="meta-line">
              <span>{{ t('papers.updatedAt') }}: {{ formatDate(paper.updatedAt) }}</span>
              <span v-if="paper.submittedAt">
                {{ t('papers.submittedAt') }}: {{ formatDate(paper.submittedAt) }}
              </span>
            </p>
          </div>
          <aside class="side-info" v-if="paper.moderatorComment">
            <strong>{{ t('papers.moderatorComment') }}</strong>
            <p>{{ paper.moderatorComment }}</p>
          </aside>
        </header>

        <form class="form" @submit.prevent="submit">
          <fieldset :disabled="!canEdit || saving">
            <label>
              <span>{{ t('paperAdd.title') }}</span>
              <input type="text" v-model="form.title" required />
            </label>
            <label>
              <span>{{ t('paperAdd.abstract') }}</span>
              <textarea v-model="form.abstract" rows="5"></textarea>
            </label>
            <div class="grid">
              <label>
                <span>{{ t('paperAdd.year') }}</span>
                <input type="number" v-model="form.year" min="1900" max="2100" />
              </label>
              <label>
                <span>{{ t('paperAdd.pdfSource') }}</span>
                <input type="text" v-model="form.best_oa_location" placeholder="https://..." />
              </label>
            </div>

            <section class="subsection">
              <div class="row">
                <h3>{{ t('paperAdd.related') }}</h3>
                <button class="btn" type="button" @click="addRelated">
                  {{ t('common.add') }}
                </button>
              </div>
              <div class="list" v-if="form.related_paper.length">
                <div class="item" v-for="(rel, idx) in form.related_paper" :key="idx">
                  <input type="text" v-model="rel.id" />
                  <button class="btn" type="button" @click="removeRelated(idx)">
                    {{ t('common.remove') }}
                  </button>
                </div>
              </div>
            </section>

            <section class="subsection">
              <div class="row">
                <h3>{{ t('paperAdd.referenced') }}</h3>
                <button class="btn" type="button" @click="addReferenced">
                  {{ t('common.add') }}
                </button>
              </div>
              <div class="list" v-if="form.referenced_paper.length">
                <div class="item" v-for="(ref, idx) in form.referenced_paper" :key="idx">
                  <input type="text" v-model="ref.id" />
                  <button class="btn" type="button" @click="removeReferenced(idx)">
                    {{ t('common.remove') }}
                  </button>
                </div>
              </div>
            </section>
          </fieldset>

          <div class="feedback">
            <span class="ok" v-if="successMsg">{{ successMsg }}</span>
            <span class="err" v-else-if="errorMsg">{{ errorMsg }}</span>
            <span class="muted" v-else-if="!canEdit">{{ t('paperEdit.readonly') }}</span>
          </div>

          <div class="actions">
            <button class="btn" type="button" @click="goBack">
              {{ t('common.cancel') }}
            </button>
            <button class="btn primary" type="submit" :disabled="saving || !canEdit">
              {{ saving ? t('common.submitting') : t('common.save') }}
            </button>
          </div>
        </form>
      </template>
      <section v-else-if="loading" class="empty">
        <p class="muted">{{ t('common.loading') }}</p>
      </section>
      <section v-else class="empty">
        <h3>{{ t('papers.errNotFound') }}</h3>
        <p class="muted">{{ t('paperEdit.notFoundHint') }}</p>
        <button class="btn primary" type="button" @click="goBack">
          {{ t('papers.action.back') }}
        </button>
      </section>
    </div>
  </div>
</template>

<style scoped>
.area {
  position: fixed;
  inset: var(--layout-inset, 60px 20px 20px 310px);
  transition: all var(--transition-slow) ease;
  overflow-y: auto;
  padding: var(--space-4) var(--space-4) var(--space-5);
}
.area.collapsed {
  --layout-inset: 60px 20px 20px 80px;
}
.container {
  max-width: 900px;
  margin: 0 auto;
  display: grid;
  gap: var(--space-4);
}
.head {
  display: flex;
  gap: var(--space-4);
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
}
.head h2 {
  margin: 0;
}
.btn.link {
  background: none;
  border: none;
  padding: 0;
  color: var(--color-primary-secondary);
  cursor: pointer;
  text-decoration: underline;
}
.muted {
  color: var(--color-muted);
}
.meta-line {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}
.status {
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
}
.status.success {
  background: color-mix(in oklab, var(--color-success), white 70%);
  color: var(--color-success);
}
.status.warning {
  background: color-mix(in oklab, var(--color-warning), white 70%);
  color: var(--color-warning);
}
.status.danger {
  background: color-mix(in oklab, var(--color-danger), white 70%);
  color: var(--color-danger);
}
.status.info {
  background: color-mix(in oklab, var(--color-primary-secondary), white 70%);
  color: var(--color-primary-secondary);
}
.side-info {
  min-width: 240px;
  max-width: 320px;
  padding: var(--space-2);
  border-left: 2px solid var(--color-border);
  background: var(--color-bg-secondary);
  border-radius: 8px;
}
.form {
  display: grid;
  gap: var(--space-4);
}
fieldset {
  display: grid;
  gap: var(--space-3);
  border: none;
  padding: 0;
  margin: 0;
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
input[type='number'],
textarea {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-surface);
  color: var(--color-text);
}
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3);
}
.subsection {
  display: grid;
  gap: var(--space-3);
}
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-2);
}
.list {
  display: grid;
  gap: var(--space-2);
}
.item {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--space-2);
}
.feedback {
  min-height: 1.25rem;
}
.ok {
  color: var(--color-success);
}
.err {
  color: var(--color-danger);
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
}
.btn {
  border: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
}
.btn.primary {
  background: var(--color-primary-secondary);
  border-color: var(--color-primary-secondary);
  color: #fff;
}
.empty {
  padding: var(--space-4);
  border: 1px dashed var(--color-border);
  border-radius: 10px;
  text-align: center;
  background: var(--color-bg-secondary);
}
@media (max-width: 960px) {
  .area {
    --layout-inset: 60px 16px 16px 120px;
  }
  .area.collapsed {
    --layout-inset: 60px 16px 16px 24px;
  }
  .side-info {
    width: 100%;
    max-width: none;
  }
}
@media (max-width: 768px) {
  .area {
    position: static;
    margin: calc(60px + var(--space-3)) var(--space-3) var(--space-4);
    padding: 0;
  }
  .head {
    flex-direction: column;
  }
  .actions {
    justify-content: flex-start;
    flex-wrap: wrap;
  }
  .grid {
    grid-template-columns: 1fr;
  }
  .container {
    padding: var(--space-3) var(--space-2) var(--space-4);
  }
}
</style>
