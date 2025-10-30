<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useSettingStore } from '@/stores/settingStore'
import { useAuthStore } from '@/stores/authStore'
import { useChatStore, type PaperCard } from '@/stores/chatStore'
import { AlibApi } from '@/api/useAlibApi'
import type { PaperResponse } from '@/api/types'

const useSetting = useSettingStore()
const auth = useAuthStore()
const chatStore = useChatStore()

const query = ref('')
const loading = ref(false)
const errorMsg = ref('')

const selectedMessageId = ref<string | null>(null)
const selectedPaperKey = ref<string | null>(null)
const logRef = ref<HTMLElement | null>(null)

const messages = computed(() => chatStore.activeChat?.messages ?? [])
const hasMessages = computed(() => messages.value.length > 0)
const searchBlocked = computed(() => Boolean((auth as any).isAdmin?.value || (auth as any).isModerator?.value))

const activeMessage = computed(() => {
  if (!selectedMessageId.value) return null
  return messages.value.find((item) => item.id === selectedMessageId.value) ?? null
})

const activePaper = computed(() => {
  const message = activeMessage.value
  if (!message || !selectedPaperKey.value) return null
  return message.results.find((paper) => paper.key === selectedPaperKey.value) ?? null
})

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit',
  minute: '2-digit',
})

function formatTime(ts: number) {
  return timeFormatter.format(new Date(ts))
}

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

async function runSearch(text?: string) {
  const searchText = (text ?? query.value).trim()
  errorMsg.value = ''
  if (searchBlocked.value) {
    errorMsg.value = 'Search is disabled for your role.'
    return
  }
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
    const message = chatStore.addMessage(searchText, mapped)
    if (!mapped.length) {
      errorMsg.value = 'No results matched your query.'
    }
    selectedMessageId.value = message.id
    selectedPaperKey.value = mapped[0]?.key ?? null
    await nextTick()
    if (logRef.value) {
      logRef.value.scrollTop = logRef.value.scrollHeight
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

function selectPaper(messageId: string, paperKey: string) {
  selectedMessageId.value = messageId
  selectedPaperKey.value = paperKey
}

onMounted(() => {
  if (!chatStore.activeChatId) {
    const chat = chatStore.createChat()
    chatStore.setActiveChat(chat.id)
  }
})

watch(
  () => chatStore.activeChatId,
  () => {
    const msgs = chatStore.activeChat?.messages ?? []
    if (msgs.length) {
      const last = msgs[msgs.length - 1]
      selectedMessageId.value = last.id
      selectedPaperKey.value = last.results[0]?.key ?? null
      nextTick().then(() => {
        if (logRef.value) {
          logRef.value.scrollTop = logRef.value.scrollHeight
        }
      })
    } else {
      selectedMessageId.value = null
      selectedPaperKey.value = null
    }
  },
  { immediate: true },
)

watch(
  messages,
  async () => {
    await nextTick()
    if (logRef.value) {
      logRef.value.scrollTop = logRef.value.scrollHeight
    }
  },
  { deep: true },
)
</script>
<template>
  <div class="chat" :class="{ collapsed: useSetting.LeftTabHidden }">
    <div class="main-chat" :class="{ collapsed: useSetting.LeftTabHidden }">
      <div class="status" v-if="loading || errorMsg">
        <span v-if="loading" class="status__loading">Searching...</span>
        <span v-else class="status__error">{{ errorMsg }}</span>
      </div>

      <div class="chat-log" ref="logRef">
        <template v-if="hasMessages">
          <section
            v-for="message in messages"
            :key="message.id"
            class="chat-turn"
            :class="{ active: message.id === selectedMessageId }"
          >
            <header class="chat-turn__header">
              <span class="chat-turn__prompt">{{ message.query }}</span>
              <span class="chat-turn__time">{{ formatTime(message.createdAt) }}</span>
            </header>

            <div v-if="message.results.length" class="results-grid">
              <div class="cards">
                <article
                  v-for="paper in message.results"
                  :key="paper.key"
                  :class="[
                    'paper-card',
                    {
                      'paper-card--active':
                        message.id === selectedMessageId && paper.key === selectedPaperKey,
                    },
                  ]"
                  tabindex="0"
                  @click="selectPaper(message.id, paper.key)"
                  @keydown.enter.prevent="selectPaper(message.id, paper.key)"
                  @keydown.space.prevent="selectPaper(message.id, paper.key)"
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

              <aside v-if="message.id === selectedMessageId && activePaper" class="paper-preview">
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
              </aside>
            </div>

            <p v-else class="no-results">No results captured for this query.</p>
          </section>
        </template>
        <div v-else class="empty-state">
          <p>Start a new search to see results here.</p>
        </div>
      </div>
    </div>

    <form class="input-area" @submit.prevent="onSubmit">
      <span v-if="searchBlocked" class="blocked-note">Search disabled for Admin/Moderator</span>
      <input
        v-model="query"
        type="search"
        placeholder="e.g. interpretable machine learning"
        :disabled="loading || searchBlocked"
      />
      <button class="btn btn-icon" type="submit" :disabled="loading || searchBlocked">
        {{ searchBlocked ? 'Blocked' : (loading ? 'Searching...' : 'Search') }}
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
  grid-template-rows: auto auto 1fr;
  gap: var(--space-3);
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

.chat-log {
  position: relative;
  overflow-y: auto;
  padding-right: 4px;
  display: grid;
  gap: var(--space-4);
  padding-bottom: var(--space-2);
}

.chat-turn {
  background: rgba(0, 0, 0, 0.03);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  display: grid;
  gap: var(--space-3);
  border: 1px solid transparent;
  transition:
    border-color var(--transition-fast) ease,
    box-shadow var(--transition-fast) ease;
}
.chat-turn.active {
  border-color: var(--color-primary-secondary);
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.08);
}
.chat-turn__header {
  display: flex;
  justify-content: space-between;
  gap: var(--space-2);
  align-items: baseline;
}
.chat-turn__prompt {
  font-weight: 600;
  font-size: 1.05rem;
}
.chat-turn__time {
  font-size: 0.8rem;
  color: var(--color-muted);
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

.results-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.9fr);
  gap: var(--space-4);
  align-items: start;
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

.paper-card--active {
  border-color: var(--color-primary-secondary);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.14);
  transform: translateY(-6px) scale(1.015);
  z-index: 3;
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

.no-results {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.95rem;
}

.paper-preview {
  position: sticky;
  top: var(--space-4);
  background: var(--color-bg);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.18);
  border: 1px solid var(--color-primary-secondary);
  max-height: 60vh;
  overflow-y: auto;
  align-self: start;
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
  flex-wrap: wrap;
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
.blocked-note { color: var(--color-danger); margin-left: 8px; }

/* @media (max-width: 1200px) {
  .results-grid {
    grid-template-columns: 1fr;
  }
  .paper-preview {
    position: relative;
    top: auto;
    max-height: none;
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
