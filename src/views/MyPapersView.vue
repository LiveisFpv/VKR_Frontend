<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import UpTab from '@/components/UpTab.vue'
import LeftTab from '@/components/LeftTab.vue'
import { usePaperStore, type PaperStatus } from '@/stores/paperStore'
import { locale, useI18n } from '@/i18n'
import { useLayoutInset } from '@/composables/useLayoutInset'

const paperStore = usePaperStore()
const router = useRouter()
const { t } = useI18n()
const { LeftTabHidden: leftHidden, layoutInset } = useLayoutInset()

const statusKeyMap: Record<PaperStatus, string> = {
  DRAFT: 'papers.status.draft',
  PENDING: 'papers.status.pending',
  REJECTED: 'papers.status.rejected',
  APPROVED: 'papers.status.approved',
}

onMounted(() => {
  paperStore.loadMyPapers()
})

const items = computed(() => paperStore.getMyPapers())

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

function statusLabel(status: PaperStatus) {
  return t(statusKeyMap[status])
}

function statusTone(status: PaperStatus) {
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

function goToEdit(id: string) {
  router.push({ name: 'paper-edit', params: { id } })
}

function goToAdd() {
  router.push({ path: '/paper/add' })
}

function handleRefresh() {
  paperStore.loadMyPapers()
}

const addIcon = new URL('@/assets/plus-line-icon.svg', import.meta.url).href
</script>

<template>
  <UpTab :show-menu="false" :show-upload="false" />
  <LeftTab />
  <div class="area" :class="{ collapsed: leftHidden }" :style="{ '--layout-inset': layoutInset }">
    <div class="container">
      <div class="head">
        <div>
          <h2>{{ t('papers.title') }}</h2>
          <!-- <p class="muted">{{ t('papers.subtitle') }}</p> -->
        </div>
        <div class="head-actions">
          <button class="btn primary" type="button" @click="goToAdd">
            <img :src="addIcon" alt="" class="btn-icon" />
            {{ t('nav.addPaper') }}
          </button>
        </div>
      </div>

      <div class="list" v-if="items.length">
        <article class="card" v-for="paper in items" :key="paper.id">
          <header class="row">
            <div class="meta">
              <h3>{{ paper.title }}</h3>
              <div class="meta-line">
                <span>{{ t('papers.updatedAt') }}: {{ formatDate(paper.updatedAt) }}</span>
                <span v-if="paper.submittedAt">
                  {{ t('papers.submittedAt') }}: {{ formatDate(paper.submittedAt) }}
                </span>
              </div>
            </div>
            <div class="status" :class="statusTone(paper.status)">
              {{ statusLabel(paper.status) }}
            </div>
          </header>

          <dl class="info">
            <div class="info-pair">
              <dt>{{ t('papers.statusLabel') }}</dt>
              <dd>{{ statusLabel(paper.status) }}</dd>
            </div>
            <div class="info-pair">
              <dt>{{ t('papers.moderatorComment') }}</dt>
              <dd>
                <template v-if="paper.moderatorComment">{{ paper.moderatorComment }}</template>
                <span v-else class="muted">{{ t('papers.noModeratorComment') }}</span>
              </dd>
            </div>
          </dl>

          <footer class="actions">
            <button
              class="btn primary"
              type="button"
              v-if="paperStore.canEdit(paper.id)"
              @click="goToEdit(paper.id)"
            >
              {{ t('papers.action.edit') }}
            </button>
            <button class="btn" type="button" @click="$router.push({ path: `/paper/${paper.id}` })">
              {{ t('papers.action.viewPublic') }}
            </button>
          </footer>
        </article>
      </div>
      <div class="empty" v-else>
        <p class="muted">{{ t('papers.empty') }}</p>
      </div>
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
  justify-content: space-between;
  align-items: center;
  gap: var(--space-3);
}
.head-actions {
  display: inline-flex;
  gap: var(--space-2);
  align-items: center;
  flex-wrap: wrap;
  margin-top: var(--space-2);
}
.head h2 {
  margin: 0;
}
.muted {
  color: var(--color-muted);
}
.list {
  display: grid;
  gap: var(--space-3);
}
.card {
  display: grid;
  gap: var(--space-3);
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-bg-secondary);
}
.row {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
  align-items: flex-start;
}
.meta h3 {
  margin: 0;
}
.meta-line {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  color: var(--color-text-secondary);
  font-size: 0.88rem;
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
.info {
  display: grid;
  gap: var(--space-2);
  margin: 0;
}
.info-pair {
  display: grid;
  gap: 4px;
}
dt {
  font-size: 0.82rem;
  color: var(--color-muted);
}
dd {
  margin: 0;
  color: var(--color-text);
}
.actions {
  display: flex;
  gap: var(--space-2);
  justify-content: flex-end;
  flex-wrap: wrap;
}
.btn {
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
}
.btn.primary {
  background: var(--color-primary-secondary);
  border-color: var(--color-primary-secondary);
  color: #fff;
}
.btn-icon {
  width: 1em;
  height: 1em;
  filter: var(--logo-filter);
  margin-right: 6px;
}
.empty {
  padding: var(--space-4);
  text-align: center;
  border: 1px dashed var(--color-border);
  border-radius: 10px;
  background: var(--color-bg);
}
@media (max-width: 1280px) {
  .area {
    --layout-inset: 60px 16px 16px 260px;
  }
  .area.collapsed {
    --layout-inset: 60px 16px 16px 80px;
  }
}
@media (max-width: 960px) {
  .area {
    --layout-inset: 60px 16px 16px 120px;
  }
  .area.collapsed {
    --layout-inset: 60px 16px 16px 24px;
  }
}
@media (max-width: 768px) {
  .area {
    position: static;
    margin: calc(60px + var(--space-3)) var(--space-3) var(--space-4);
  }
  .head,
  .row {
    flex-direction: column;
    align-items: stretch;
  }
  .head-actions {
    justify-content: flex-start;
  }
  .actions {
    justify-content: flex-start;
  }
}
</style>
