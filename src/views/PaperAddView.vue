<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import UpTab from '@/components/UpTab.vue'
import LeftTab from '@/components/LeftTab.vue'
import { AlibApi } from '@/api/useAlibApi'
import { useI18n } from '@/i18n'
import { usePaperStore } from '@/stores/paperStore'
import { useLayoutInset } from '@/composables/useLayoutInset'

type Related = { id: string }
type Referenced = { id: string }

const initialYear = new Date().getFullYear()

const form = reactive({
  title: '',
  abstract: '',
  year: initialYear,
  best_oa_location: '',
  related_paper: [] as Related[],
  referenced_paper: [] as Referenced[],
})

const saving = ref(false)
const successMsg = ref('')
const errorMsg = ref('')
const { t } = useI18n()
const router = useRouter()
const paperStore = usePaperStore()
const { LeftTabHidden: leftHidden, layoutInset } = useLayoutInset()

const papersIcon = new URL('@/assets/papers-icon.svg', import.meta.url).href
const plusIcon = new URL('@/assets/plus-line-icon.svg', import.meta.url).href

function addRelated() {
  form.related_paper.push({ id: '' })
}
function removeRelated(i: number) {
  form.related_paper.splice(i, 1)
}
function addReferenced() {
  form.referenced_paper.push({ id: '' })
}
function removeReferenced(i: number) {
  form.referenced_paper.splice(i, 1)
}

async function submit() {
  successMsg.value = ''
  errorMsg.value = ''
  if (!form.title.trim()) {
    errorMsg.value = t('paperAdd.errNoTitle')
    return
  }
  try {
    saving.value = true
    await AlibApi.addPaper({
      title: form.title.trim(),
      abstract: form.abstract.trim() || undefined,
      year: Number(form.year) || undefined,
      best_oa_location: form.best_oa_location || undefined,
      related_paper: form.related_paper
        .filter((r) => r.id.trim())
        .map((r) => ({ id: r.id.trim() })),
      referenced_paper: form.referenced_paper
        .filter((r) => r.id.trim())
        .map((r) => ({ id: r.id.trim() })),
    })
    await paperStore.savePaper({
      title: form.title.trim(),
      abstract: form.abstract.trim() || undefined,
      year: Number(form.year) || undefined,
      best_oa_location: form.best_oa_location || undefined,
      related_paper: form.related_paper
        .filter((r) => r.id.trim())
        .map((r) => ({ id: r.id.trim() })),
      referenced_paper: form.referenced_paper
        .filter((r) => r.id.trim())
        .map((r) => ({ id: r.id.trim() })),
      status: 'PENDING',
    })
    successMsg.value = t('paperAdd.okSubmitted')
    clearForm()
  } catch (e: any) {
    errorMsg.value = e?.message || t('paperAdd.errSubmit')
  } finally {
    saving.value = false
  }
}

function clearForm() {
  form.title = ''
  form.abstract = ''
  form.year = initialYear
  form.best_oa_location = ''
  form.related_paper = []
  form.referenced_paper = []
}

function resetForm() {
  clearForm()
  successMsg.value = ''
  errorMsg.value = ''
}

function goToMyPapers() {
  router.push({ path: '/paper/my' })
}
</script>

<template>
  <UpTab :show-menu="false" :show-upload="false" />
  <LeftTab :hidden="true" />
  <div
    class="paper-add"
    :class="{ collapsed: leftHidden }"
    :style="{ '--layout-inset': layoutInset }"
  >
    <div class="container">
      <header class="page-head">
        <div class="page-title">
          <h2>{{ t('paperAdd.header') }}</h2>
          <p class="muted">{{ t('paperAdd.subtitle') }}</p>
        </div>
        <div class="page-actions">
          <button class="btn surface" type="button" @click="resetForm" :disabled="saving">
            {{ t('common.reset') }}
          </button>
          <button class="btn ghost" type="button" @click="goToMyPapers">
            <img :src="papersIcon" alt="" class="btn-icon" />
            {{ t('paperAdd.toMyPapers') }}
          </button>
        </div>
      </header>

      <div class="layout">
        <section class="form-card">
          <form class="form" @submit.prevent="submit">
            <div class="status-banner" v-if="successMsg || errorMsg">
              <div class="message message--success" v-if="successMsg">{{ successMsg }}</div>
              <div class="message message--error" v-else>{{ errorMsg }}</div>
            </div>

            <section class="section">
              <header class="section-head">
                <div class="section-heading">
                  <span class="section-badge">{{ t('paperAdd.stepBasics') }}</span>
                  <div>
                    <h3>{{ t('paperAdd.metaHeader') }}</h3>
                    <p class="muted">{{ t('paperAdd.metaHint') }}</p>
                  </div>
                </div>
              </header>
              <div class="field-stack">
                <label class="field">
                  <span>{{ t('paperAdd.title') }}</span>
                  <input
                    type="text"
                    v-model="form.title"
                    :placeholder="t('paperAdd.placeholderTitle')"
                    required
                  />
                </label>
                <label class="field">
                  <span>{{ t('paperAdd.abstract') }}</span>
                  <textarea
                    v-model="form.abstract"
                    :placeholder="t('paperAdd.placeholderAbstract')"
                  ></textarea>
                </label>
                <div class="field-grid">
                  <label class="field">
                    <span>{{ t('paperAdd.year') }}</span>
                    <input type="number" v-model="form.year" min="1900" max="2100" />
                  </label>
                  <label class="field">
                    <span>{{ t('paperAdd.pdfSource') }}</span>
                    <input
                      type="text"
                      v-model="form.best_oa_location"
                      :placeholder="t('paperAdd.placeholderUrl')"
                    />
                  </label>
                </div>
              </div>
            </section>

            <section class="section">
              <header class="section-head">
                <div class="section-heading">
                  <span class="section-badge">{{ t('paperAdd.stepRelated') }}</span>
                  <div>
                    <h3>{{ t('paperAdd.related') }}</h3>
                    <p class="muted">{{ t('paperAdd.relatedHint') }}</p>
                  </div>
                </div>
                <button class="btn ghost" type="button" @click="addRelated">
                  <img :src="plusIcon" alt="" class="btn-icon" />
                  {{ t('common.add') }}
                </button>
              </header>
              <div class="relation-list">
                <div class="relation-item" v-for="(r, i) in form.related_paper" :key="`rel-${i}`">
                  <input type="text" v-model="r.id" :placeholder="t('paperAdd.idPlaceholder')" />
                  <button class="btn surface" type="button" @click="removeRelated(i)">
                    {{ t('common.remove') }}
                  </button>
                </div>
                <p class="placeholder" v-if="!form.related_paper.length">
                  {{ t('paperAdd.noRelated') }}
                </p>
              </div>
            </section>

            <section class="section">
              <header class="section-head">
                <div class="section-heading">
                  <span class="section-badge">{{ t('paperAdd.stepReferences') }}</span>
                  <div>
                    <h3>{{ t('paperAdd.referenced') }}</h3>
                    <p class="muted">{{ t('paperAdd.referencedHint') }}</p>
                  </div>
                </div>
                <button class="btn ghost" type="button" @click="addReferenced">
                  <img :src="plusIcon" alt="" class="btn-icon" />
                  {{ t('common.add') }}
                </button>
              </header>
              <div class="relation-list">
                <div
                  class="relation-item"
                  v-for="(r, i) in form.referenced_paper"
                  :key="`ref-${i}`"
                >
                  <input type="text" v-model="r.id" :placeholder="t('paperAdd.idPlaceholder')" />
                  <button class="btn surface" type="button" @click="removeReferenced(i)">
                    {{ t('common.remove') }}
                  </button>
                </div>
                <p class="placeholder" v-if="!form.referenced_paper.length">
                  {{ t('paperAdd.noReferenced') }}
                </p>
              </div>
            </section>

            <div class="form-footer">
              <button class="btn surface" type="button" @click="resetForm" :disabled="saving">
                {{ t('common.reset') }}
              </button>
              <button class="btn primary" type="submit" :disabled="saving">
                {{ saving ? t('common.submitting') : t('common.submit') }}
              </button>
            </div>
          </form>
        </section>

        <aside class="sidebar">
          <div class="summary-card">
            <h4>{{ t('paperAdd.sidebar.title') }}</h4>
            <ul class="hint-list">
              <li>{{ t('paperAdd.sidebar.tip1') }}</li>
              <li>{{ t('paperAdd.sidebar.tip2') }}</li>
              <li>{{ t('paperAdd.sidebar.tip3') }}</li>
            </ul>
            <p class="muted small">{{ t('paperAdd.sidebar.help') }}</p>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.paper-add {
  position: fixed;
  inset: var(--layout-inset, 60px 20px 20px 310px);
  transition: all var(--transition-slow) ease;
  overflow-y: auto;
  padding: var(--space-4) var(--space-4) var(--space-5);
}
.paper-add.collapsed {
  --layout-inset: 60px 20px 20px 80px;
}
.container {
  max-width: 960px;
  margin: 0 auto;
  display: grid;
  gap: var(--space-4);
}
.page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-3);
  flex-wrap: wrap;
}
.page-title h2 {
  margin: 0;
}
.page-title .muted {
  margin: 4px 0 0;
}
.page-actions {
  display: inline-flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}
.layout {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: minmax(0, 1fr) 280px;
  align-items: start;
}
.form-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--space-5);
}
.form {
  display: grid;
  gap: var(--space-4);
}
.status-banner {
  display: grid;
  gap: var(--space-2);
}
.message {
  padding: 10px 14px;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  font-size: 0.95rem;
}
.message--success {
  color: var(--color-success);
  background: color-mix(in oklab, var(--color-success), white 86%);
  border-color: color-mix(in oklab, var(--color-success), white 75%);
}
.message--error {
  color: var(--color-danger);
  background: color-mix(in oklab, var(--color-danger), white 88%);
  border-color: color-mix(in oklab, var(--color-danger), white 78%);
}
.section {
  display: grid;
  gap: var(--space-3);
  padding-block: var(--space-3);
}
.section + .section {
  border-top: 1px solid var(--color-border);
  padding-top: var(--space-4);
}
.section-head {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
  flex-wrap: wrap;
  align-items: center;
}
.section-heading {
  display: inline-flex;
  gap: var(--space-2);
  align-items: flex-start;
}
.section-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 34px;
  padding: 4px 10px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-primary);
  background: color-mix(in oklab, var(--color-primary-secondary), transparent 75%);
  border-radius: 999px;
}
.field-stack {
  display: grid;
  gap: var(--space-3);
}
.field-grid {
  display: grid;
  gap: var(--space-3);
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}
.field {
  display: grid;
  gap: 6px;
}
.field span {
  color: var(--color-muted);
  font-size: 0.9rem;
}
input[type='text'],
input[type='number'],
textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-bg);
  color: var(--color-text);
  transition:
    border-color var(--transition-base),
    box-shadow var(--transition-base);
}
input[type='text']:focus,
input[type='number']:focus,
textarea:focus {
  border-color: var(--color-primary-secondary);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary-secondary), transparent 80%);
  outline: none;
}
textarea {
  min-height: 140px;
  resize: vertical;
}
.relation-list {
  display: grid;
  gap: var(--space-2);
}
.relation-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: var(--space-2);
  align-items: center;
}
.placeholder {
  margin: 0;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  text-align: center;
  color: var(--color-muted);
  background: color-mix(in oklab, var(--color-bg-secondary), transparent 60%);
}
.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  flex-wrap: wrap;
}
.btn {
  border: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
  padding: 8px 14px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition:
    background var(--transition-base),
    border-color var(--transition-base),
    transform var(--transition-fast);
}
.btn:hover {
  background: color-mix(in oklab, var(--color-surface), var(--color-text) 4%);
  border-color: var(--color-border);
}
.btn:active {
  transform: translateY(1px);
}
.btn-icon {
  width: 1em;
  height: 1em;
  filter: var(--logo-filter);
}
.btn.primary {
  background: var(--color-primary-secondary);
  border-color: var(--color-primary-secondary);
  color: #fff;
}
.btn.ghost {
  background: transparent;
  border-color: transparent;
  color: var(--color-primary);
}
.btn.ghost:hover {
  background: color-mix(in oklab, var(--color-primary-secondary), transparent 85%);
  border-color: color-mix(in oklab, var(--color-primary-secondary), transparent 70%);
}
.btn.surface {
  background: var(--color-surface);
  border-color: var(--color-border);
  color: var(--color-text);
}
.sidebar {
  display: grid;
  gap: var(--space-3);
}
.summary-card {
  background: color-mix(in oklab, var(--color-bg-secondary), transparent 30%);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  display: grid;
  gap: var(--space-3);
}
.summary-card h4 {
  margin: 0;
}
.hint-list {
  display: grid;
  gap: var(--space-2);
  padding-left: 1.1rem;
  margin: 0;
}
.hint-list li {
  color: var(--color-muted);
}
.small {
  font-size: 0.85rem;
}

@media (max-width: 1100px) {
  .layout {
    grid-template-columns: minmax(0, 1fr);
  }
  .sidebar {
    order: -1;
  }
}

@media (max-width: 768px) {
  .paper-add,
  .paper-add.collapsed {
    position: static;
    inset: auto;
    margin: calc(60px + var(--space-3)) var(--space-3) var(--space-4);
    padding: 0;
  }
  .container {
    padding: var(--space-3) var(--space-2) var(--space-4);
  }
  .page-head {
    flex-direction: column;
    align-items: stretch;
  }
  .page-actions {
    justify-content: flex-start;
  }
  .form-card {
    padding: var(--space-4) var(--space-3);
  }
}
</style>
