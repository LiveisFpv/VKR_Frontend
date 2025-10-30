<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingStore } from '@/stores/settingStore'
import { useChatStore } from '@/stores/chatStore'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
const authStore = useAuthStore()
const router = useRouter()
const useSetting = useSettingStore()
const chatStore = useChatStore()
const { history: chats, activeChatId } = storeToRefs(chatStore)
const leftTabHidden = ref(useSetting.LeftTabHidden)
function toggleLeftTab() {
  useSetting.HideLeftTab()
  leftTabHidden.value = useSetting.LeftTabHidden
}
function RedirecttoSettings() {
  router.push('/settings')
}
function RedirecttoHome() {
  router.push('/')
}
function RedirecttoWriterCabinet() {
  router.push('/paper/add')
}
function RedirecttoAdmin() {
  router.push('/admin')
}
function RedirecttoModerator() {
  router.push('/moderator')
}

function handleNewSearch() {
  const chat = chatStore.createChat()
  router.push('/')
  chatStore.setActiveChat(chat.id)
}

function selectChat(id: string) {
  chatStore.setActiveChat(id)
  router.push('/')
}

const props = defineProps<{
  hidden?: boolean
}>()

const hidden = computed(() => props.hidden ?? null)

watch(
  hidden,
  (val) => {
    if (val != leftTabHidden.value) {
      toggleLeftTab()
    }
  },
  { immediate: true },
)
</script>
<template>
  <div class="left-tab" :class="{ hidden: leftTabHidden }">
    <div class="header" :class="{ hidden: leftTabHidden }">
      <button class="btn btn-icon" @click="RedirecttoHome" aria-label="Home">
        <img src="/src/assets/book-logo.svg" alt="L" class="logo" />
      </button>
      <button class="btn btn-icon" @click="toggleLeftTab" aria-label="Toggle sidebar">
        {{ leftTabHidden ? '→' : '←' }}
      </button>
    </div>
    <div class="menu">
      <!-- Author access -->
      <button
        class="btn-menu btn"
        v-if="
          authStore.User &&
          authStore.isUserRole &&
          !(authStore.User && (authStore.isAdmin || authStore.isModerator))
        "
        @click="RedirecttoWriterCabinet"
      >
        <div class="icon-text">
          <img src="/src/assets/papers-icon.svg" alt="|=|" class="logo" />
          <p v-if="!leftTabHidden">Add Paper</p>
        </div>
      </button>

      <!-- Moderator access -->
      <button
        class="btn-menu btn"
        v-if="authStore.User && authStore.isModerator"
        @click="RedirecttoModerator"
      >
        <div class="icon-text">
          <img src="/src/assets/papers-icon.svg" alt="M" class="logo" />
          <p v-if="!leftTabHidden">Moderation</p>
        </div>
      </button>

      <!-- Admin access -->
      <button
        class="btn-menu btn"
        v-if="authStore.User && authStore.isAdmin"
        @click="RedirecttoAdmin"
      >
        <div class="icon-text">
          <img src="/src/assets/manage-icon.svg" alt="A" class="logo" />
          <p v-if="!leftTabHidden">Admin Panel</p>
        </div>
      </button>

      <!-- Search controls hidden for admin/moderator -->
      <button
        class="btn-menu btn"
        @click="handleNewSearch"
        v-if="!(authStore.User && (authStore.isAdmin || authStore.isModerator))"
      >
        <div class="icon-text">
          <img src="/src/assets/plus-line-icon.svg" alt="" class="logo" />
          <p v-if="!leftTabHidden">New search</p>
        </div>
      </button>
      <button
        class="btn-menu btn"
        v-if="!(authStore.User && (authStore.isAdmin || authStore.isModerator))"
      >
        <div class="icon-text">
          <img src="/src/assets/search-icon.svg" alt="" class="logo" />
          <p v-if="!leftTabHidden">Search chats</p>
        </div>
      </button>
    </div>
    <div
      class="menu history"
      v-if="!leftTabHidden && !(authStore.User && (authStore.isAdmin || authStore.isModerator))"
    >
      <label for="menu" class="label">History</label>
      <template v-if="chats.length">
        <button
          v-for="chat in chats"
          :key="chat.id"
          class="btn-menu btn history-item"
          :class="{ active: chat.id === activeChatId }"
          @click="selectChat(chat.id)"
        >
          <span class="history-title">{{ chat.title }}</span>
        </button>
      </template>
      <p v-else class="placeholder">No chats yet. Start a new search.</p>
    </div>
    <div class="footer">
      <button class="btn-menu btn" @click="RedirecttoSettings">
        <div class="icon-text">
          <img src="/src/assets/manage-icon.svg" alt="S" class="logo" />
          <p v-if="!leftTabHidden">Settings</p>
        </div>
      </button>
    </div>
  </div>
</template>
<style lang="css" scoped>
.left-tab {
  display: flex;
  flex-direction: column;
  width: 250px;
  height: 100vh;
  background-color: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border);
  border-bottom-right-radius: 25px;
  border-top-right-radius: 25px;
  padding: 15px 5px;
  padding-bottom: 5px;
  transition: all var(--transition-slow) ease;
}

.left-tab.hidden {
  width: 60px;
  border-bottom-right-radius: 0px;
  border-top-right-radius: 0px;
}

.header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 0px 10px;
  transition: all var(--transition-slow) ease;
}

.header.hidden {
  justify-content: center;
  flex-direction: column;
  padding: 0px 5px;
  gap: 10px;
}

.icon-text {
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
}

.icon-text p {
  margin: 0;
  line-height: 1.2;
}

.icon-text .logo {
  width: 1em;
  height: 1em;
}

.menu {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.menu.history {
  align-items: stretch;
  gap: 8px;
}
.label {
  align-self: flex-start;
  margin-bottom: 10px;
  font-size: medium;
  padding-left: 16px;
  color: var(--color-text-secondary);
}
.btn-menu {
  text-align: left;
  font-size: medium;
  width: 100%;
  appearance: none;
  border: 1px solid var(--color-bg-secondary);
  background: var(--color-bg-secondary);
  color: var(--color-text);
  padding: 0.55rem 0.9rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition:
    background var(--transition-base),
    border-color var(--transition-base),
    transform var(--transition-fast);
}
.btn-menu:hover {
  border-color: var(--color-border);
  background: color-mix(in oklab, var(--color-surface), var(--color-text) 3%);
}
.btn-menu:active {
  transform: translateY(1px);
}

.history-item {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-color: transparent;
}
.history-item .history-title {
  font-size: 0.95rem;
  line-height: 1.2;
  color: inherit;
}
.history-item .history-meta {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}
.history-item.active {
  border-color: var(--color-primary-secondary);
}
.history-item.active .history-meta {
  color: var(--color-primary-secondary);
}
.placeholder {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  padding: 0 16px;
  text-align: center;
}

.btn.btn-icon {
  width: 40px;
  height: 40px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-bg-secondary);
  background: var(--color-bg-secondary);
  color: var(--color-text);
  border-radius: var(--radius-md);
  line-height: 1;
}
.btn.btn-icon:hover {
  border-color: var(--color-border);
  background: color-mix(in oklab, var(--color-surface), var(--color-text) 3%);
}
.btn.btn-icon:active {
  transform: translateY(1px);
}
.btn-icon .logo {
  width: 1.2em;
  height: 1.2em;
}
.footer {
  margin-top: auto;
  display: flex;
  justify-content: center;
  padding: 10px 0;
}
</style>
