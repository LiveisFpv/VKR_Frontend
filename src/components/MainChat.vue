<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSettingStore } from '@/stores/settingStore'
import { AlibApi } from '@/api/useAlibApi'
import type { PaperResponse } from '@/api/types'

const useSetting = useSettingStore()

interface PaperCard {
  key: string
  id?: string
  title: string
  abstract: string
  year?: number
  pdfUrl?: string
  landingUrl?: string
  isOpenAccess?: boolean
  sourceName?: string
}

const query = ref('')
const history = ref<string[]>([])
const results = ref<PaperCard[]>([])
const loading = ref(false)
const errorMsg = ref('')
const hoveredKey = ref<string | null>(null)

const hasResults = computed(() => results.value.length > 0)
const activePaper = computed(() => {
  if (!hoveredKey.value) return null
  return results.value.find((paper) => paper.key === hoveredKey.value) ?? null
})

function normalizeBestLocation(raw: unknown): Record<string, any> | null {
  if (!raw) return null
  if (typeof raw === 'object') {
    return raw as Record<string, any>
  }
  if (typeof raw === 'string') {
    try {
      const prepared = raw
        .replace(/'/g, '"')
        .replace(/\bTrue\b/g, 'true')
        .replace(/\bFalse\b/g, 'false')
        .replace(/\bNone\b/g, 'null')
      return JSON.parse(prepared)
    } catch {
      try {
        return JSON.parse(raw)
      } catch {
        return null
      }
    }
  }
  return null
}

function toPaperCard(paper: PaperResponse, index: number): PaperCard | null {
  const title = paper.title?.trim()
  const abstract = paper.abstract?.trim()
  if (!title && !abstract) return null
  const best = normalizeBestLocation(paper.best_oa_location)
  return {
    key: `${paper.id || title || 'paper'}-${index}`,
    id: paper.id,
    title: title || 'Untitled paper',
    abstract: abstract || 'No abstract available.',
    year: paper.year,
    pdfUrl: best?.pdf_url,
    landingUrl: best?.landing_page_url,
    isOpenAccess: best?.is_oa,
    sourceName: best?.source?.display_name,
  }
}

function pushHistory(searchText: string) {
  const trimmed = searchText.trim()
  if (!trimmed) return
  history.value = [trimmed, ...history.value.filter((item) => item !== trimmed)].slice(0, 10)
}

async function runSearch(text?: string) {
  const searchText = (text ?? query.value).trim()
  errorMsg.value = ''
  if (!searchText) {
    errorMsg.value = 'Enter a query to search.'
    return
  }
  query.value = searchText
  loading.value = true
  try {
    const response = await AlibApi.search(searchText)
    const mapped = (response.papers ?? [])
      .map((paper, index) => toPaperCard(paper, index))
      .filter((item): item is PaperCard => !!item)
    results.value = mapped
    hoveredKey.value = mapped[0]?.key ?? null
    pushHistory(searchText)
    if (!mapped.length) {
      errorMsg.value = 'No results matched your query.'
    }
  } catch (error: any) {
    errorMsg.value = error?.message || 'Search failed. Please try again.'
  } finally {
    loading.value = false
  }
}

function onSubmit() {
  runSearch()
}

function applyHistory(searchText: string) {
  query.value = searchText
  runSearch(searchText)
}

function showPreview(key: string) {
  hoveredKey.value = key
}

function clearPreview() {
  hoveredKey.value = null
}
</script>
<template>
  <div class="chat" :class="{ collapsed: useSetting.LeftTabHidden }">
    <div class="main-chat" :class="{ collapsed: useSetting.LeftTabHidden }">
      <!-- <div class="main-header">
        <h2>Search Papers</h2>
        <p>Type a query to explore relevant publications.</p>
      </div> -->

      <section v-if="history.length" class="history">
        <div class="history-title">Search history</div>
        <div class="history-list">
          <button
            v-for="item in history"
            :key="item"
            type="button"
            class="history-chip"
            @click="applyHistory(item)"
          >
            {{ item }}
          </button>
        </div>
      </section>

      <div class="status" v-if="loading || errorMsg">
        <span v-if="loading" class="status__loading">Searching...</span>
        <span v-else class="status__error">{{ errorMsg }}</span>
      </div>

      <section class="results" :class="{ empty: !hasResults }" @mouseleave="clearPreview">
        <template v-if="hasResults">
          <div class="cards">
            <article
              v-for="paper in results"
              :key="paper.key"
              class="paper-card"
              tabindex="0"
              @mouseenter="showPreview(paper.key)"
              @focusin="showPreview(paper.key)"
            >
              <header class="paper-card__header">
                <span v-if="paper.year" class="paper-card__year">{{ paper.year }}</span>
                <h3 class="paper-card__title">{{ paper.title }}</h3>
              </header>
              <p class="paper-card__abstract">{{ paper.abstract }}</p>
              <footer class="paper-card__footer">
                <span v-if="paper.sourceName" class="paper-card__source">{{
                  paper.sourceName
                }}</span>
                <span v-if="paper.isOpenAccess" class="paper-card__badge">Open Access</span>
              </footer>
            </article>
          </div>

          <div v-if="activePaper" class="paper-preview">
            <h3>{{ activePaper.title }}</h3>
            <p class="paper-preview__abstract">{{ activePaper.abstract }}</p>
            <div class="paper-preview__meta">
              <span v-if="activePaper.year">Year: {{ activePaper.year }}</span>
              <span v-if="activePaper.sourceName">Source: {{ activePaper.sourceName }}</span>
            </div>
            <div class="paper-preview__links">
              <a
                v-if="activePaper.pdfUrl"
                :href="activePaper.pdfUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn--tiny"
              >
                Open PDF
              </a>
              <a
                v-if="activePaper.landingUrl"
                :href="activePaper.landingUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn--tiny"
              >
                Article page
              </a>
            </div>
          </div>
        </template>
        <div v-else class="empty-state">
          <p>Search history and results will appear after your first query.</p>
        </div>
      </section>
    </div>

    <form class="input-area" @submit.prevent="onSubmit">
      <input
        v-model="query"
        type="search"
        placeholder="e.g. interpretable machine learning"
        :disabled="loading"
      />
      <button class="btn btn-icon" type="submit" :disabled="loading">
        {{ loading ? 'Searching...' : 'Search' }}
      </button>
    </form>
  </div>
</template>
<style lang="css" scoped>
.chat {
  position: fixed;
  top: 80px;
  left: 310px;
  right: 60px;
  bottom: 20px;
  background-color: var(--color-bg-secondary);
  border-radius: 15px;
  padding: var(--space-4);
  display: grid;
  grid-template-rows: 1fr auto;
  gap: var(--space-3);
  transition: all var(--transition-slow) ease;
}
.chat.collapsed {
  left: 120px;
}

.main-chat {
  position: relative;
  display: grid;
  gap: var(--space-4);
  overflow: hidden;
}

.main-header h2 {
  margin: 0;
  font-size: 1.4rem;
}
.main-header p {
  margin: 4px 0 0;
  color: var(--color-muted);
  font-size: 0.95rem;
}

.history {
  display: grid;
  gap: var(--space-2);
}
.history-title {
  font-size: 0.85rem;
  text-transform: uppercase;
  color: var(--color-muted);
  letter-spacing: 0.05em;
}
.history-list {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}
.history-chip {
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  color: var(--color-text);
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: var(--transition-fast) ease;
}
.history-chip:hover,
.history-chip:focus-visible {
  background: var(--color-primary-secondary);
  color: var(--color-bg);
}

.status {
  font-size: 0.95rem;
  min-height: 1.4rem;
}
.status__loading {
  color: var(--color-muted);
}
.status__error {
  color: var(--color-danger);
}

.results {
  position: relative;
  background: rgba(0, 0, 0, 0.03);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  overflow: hidden;
}
.results.empty {
  display: flex;
  align-items: center;
  justify-content: center;
}

.cards {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.paper-card {
  position: relative;
  flex: 1 1 260px;
  min-width: 240px;
  background: var(--color-bg);
  border-radius: var(--radius-lg);
  padding: var(--space-3);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid transparent;
  transition:
    transform var(--transition-fast) ease,
    box-shadow var(--transition-fast) ease,
    border-color var(--transition-fast) ease;
  cursor: pointer;
  outline: none;
}
.paper-card:hover,
.paper-card:focus-visible {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.12);
  border-color: var(--color-primary-secondary);
  z-index: 2;
}

.paper-card__header {
  display: grid;
  gap: 4px;
}
.paper-card__year {
  font-size: 0.75rem;
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.paper-card__title {
  margin: 0;
  font-size: 1.05rem;
}
.paper-card__abstract {
  margin: var(--space-2) 0 var(--space-3);
  color: var(--color-muted);
  line-height: 1.4;
  max-height: 6.5rem;
  overflow: hidden;
}
.paper-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 0.8rem;
  color: var(--color-muted);
}
.paper-card__badge {
  color: var(--color-success);
  font-weight: 600;
}

.paper-preview {
  position: absolute;
  right: var(--space-4);
  bottom: var(--space-4);
  max-width: min(420px, 45%);
  background: var(--color-bg);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.18);
  border: 1px solid var(--color-primary-secondary);
  z-index: 5;
}
.paper-preview h3 {
  margin: 0 0 var(--space-2);
}
.paper-preview__abstract {
  margin: 0 0 var(--space-3);
  line-height: 1.5;
}
.paper-preview__meta {
  display: flex;
  gap: var(--space-3);
  font-size: 0.85rem;
  color: var(--color-muted);
  margin-bottom: var(--space-3);
}
.paper-preview__links {
  display: flex;
  gap: var(--space-2);
}

.btn--tiny {
  font-size: 0.8rem;
  padding: 6px 10px;
  border-radius: 999px;
  background: var(--color-primary-secondary);
  color: var(--color-bg);
}

.empty-state {
  text-align: center;
  color: var(--color-muted);
  padding: var(--space-4) 0;
}

.input-area {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background-color: var(--color-bg);
  color: var(--color-text);
  display: flex;
  gap: var(--space-2);
  padding: 4px 6px;
  align-items: center;
}

.input-area input {
  border: none;
  outline: none;
  background: transparent;
  flex: 1;
  padding: 10px;
  font-size: 1rem;
}

.input-area button {
  min-width: 120px;
}

/* @media (max-width: 1200px) {
  .paper-preview {
    position: static;
    max-width: none;
    margin-top: var(--space-3);
  }
  .results {
    padding-bottom: var(--space-6);
  }
}

@media (max-width: 900px) {
  .chat {
    left: 20px;
    right: 20px;
    top: 100px;
  }
  .chat.collapsed {
    left: 20px;
  }
  .cards {
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  .chat {
    padding: var(--space-3);
    grid-template-rows: auto auto;
  }
  .paper-card {
    min-width: auto;
  }
  .input-area button {
    min-width: 80px;
  }
} */
</style>
