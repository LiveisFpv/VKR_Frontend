<script setup lang="ts">
import { reactive, ref } from 'vue'
import UpTab from '@/components/UpTab.vue'
import LeftTab from '@/components/LeftTab.vue'
import { AlibApi } from '@/api/useAlibApi'
import { useI18n } from '@/i18n'
import { usePaperStore } from '@/stores/paperStore'
import { useLayoutInset } from '@/composables/useLayoutInset'

type Related = { id: string }
type Referenced = { id: string }

const form = reactive({
  title: '',
  abstract: '',
  year: new Date().getFullYear(),
  best_oa_location: '',
  related_paper: [] as Related[],
  referenced_paper: [] as Referenced[],
})

const saving = ref(false)
const successMsg = ref('')
const errorMsg = ref('')
const { t } = useI18n()
const paperStore = usePaperStore()
const { LeftTabHidden: leftHidden, layoutInset } = useLayoutInset()

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
    // reset minimal fields
    form.title = ''
    form.abstract = ''
    form.best_oa_location = ''
    form.related_paper = []
    form.referenced_paper = []
  } catch (e: any) {
    errorMsg.value = e?.message || t('paperAdd.errSubmit')
  } finally {
    saving.value = false
  }
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
      <h2>{{ t('paperAdd.header') }}</h2>
      <form class="form" @submit.prevent="submit">
        <label>
          <span>{{ t('paperAdd.title') }}</span>
          <input type="text" v-model="form.title" placeholder="Enter a title" required />
        </label>
        <label>
          <span>{{ t('paperAdd.abstract') }}</span>
          <textarea v-model="form.abstract" rows="5" placeholder="Short description..."></textarea>
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

        <div class="subsection">
          <div class="row">
            <h3>{{ t('paperAdd.related') }}</h3>
            <button type="button" class="btn" @click="addRelated">{{ t('common.add') }}</button>
          </div>
          <div class="list" v-if="form.related_paper.length">
            <div class="item" v-for="(r, i) in form.related_paper" :key="i">
              <input type="text" v-model="r.id" placeholder="Paper ID" />
              <button type="button" class="btn" @click="removeRelated(i)">
                {{ t('common.remove') }}
              </button>
            </div>
          </div>
        </div>

        <div class="subsection">
          <div class="row">
            <h3>{{ t('paperAdd.referenced') }}</h3>
            <button type="button" class="btn" @click="addReferenced">{{ t('common.add') }}</button>
          </div>
          <div class="list" v-if="form.referenced_paper.length">
            <div class="item" v-for="(r, i) in form.referenced_paper" :key="i">
              <input type="text" v-model="r.id" placeholder="Paper ID" />
              <button type="button" class="btn" @click="removeReferenced(i)">
                {{ t('common.remove') }}
              </button>
            </div>
          </div>
        </div>

        <div class="feedback">
          <span class="ok" v-if="successMsg">{{ successMsg }}</span>
          <span class="err" v-else-if="errorMsg">{{ errorMsg }}</span>
        </div>

        <div class="actions">
          <button class="btn primary" type="submit" :disabled="saving">
            {{ saving ? t('common.submitting') : t('common.submit') }}
          </button>
        </div>
      </form>
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
  max-width: 800px;
  margin: auto;
}
.form {
  display: grid;
  gap: var(--space-4);
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
  grid-template-columns: 1fr 1fr;
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
}
</style>
