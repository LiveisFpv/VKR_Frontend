<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import UpTab from '@/components/UpTab.vue'
import LeftTab from '@/components/LeftTab.vue'

type Article = {
  id: string
  title: string
  abstract: string
  authorEmail: string
  year?: number
  status: 'pending' | 'approved' | 'rejected'
  createdAt: number
  editing?: boolean
}

const STORAGE_KEY = 'moderation.articles'
const items = reactive<Article[]>([])
const loaded = ref(false)

function saveLocal() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {}
}

function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const arr = JSON.parse(raw) as Article[]
      items.splice(0, items.length, ...arr)
      return
    }
  } catch {}
  // seed with mock data
  const now = Date.now()
  items.splice(
    0,
    items.length,
    {
      id: 'a1',
      title: 'Graph Neural Networks for Recommendations',
      abstract: 'We explore GNNs for personalized recommendations on large graphs...',
      authorEmail: 'alice@example.com',
      year: 2024,
      status: 'pending',
      createdAt: now - 86400000,
    },
    {
      id: 'a2',
      title: 'Efficient Transformers in Production',
      abstract: 'Techniques to reduce latency and memory usage while preserving accuracy...',
      authorEmail: 'bob@example.com',
      year: 2023,
      status: 'pending',
      createdAt: now - 43200000,
    },
    {
      id: 'a3',
      title: 'Ablation Studies on Vision Models',
      abstract: 'A comprehensive ablation of augmentation and regularization for ViTs...',
      authorEmail: 'carol@example.com',
      year: 2022,
      status: 'rejected',
      createdAt: now - 21600000,
    },
  )
}

onMounted(() => {
  loadLocal()
  loaded.value = true
})

function startEdit(it: Article) {
  it.editing = true
}
function cancelEdit(it: Article) {
  it.editing = false
}
function saveEdit(it: Article) {
  it.editing = false
  saveLocal()
}
function setStatus(it: Article, status: Article['status']) {
  it.status = status
  saveLocal()
}
function remove(it: Article) {
  const idx = items.findIndex((x) => x.id === it.id)
  if (idx >= 0) {
    items.splice(idx, 1)
    saveLocal()
  }
}
</script>

<template>
  <UpTab :show-menu="false" :show-upload="false" />
  <LeftTab :hidden="true" />

  <div class="area" :class="{ collapsed: true }">
    <div class="container">
      <h2>Moderator Panel</h2>
      <p class="muted">Draft version using mock data</p>

      <div class="list" v-if="items.length">
        <div class="card" v-for="it in items" :key="it.id">
          <div class="row head">
            <div class="meta">
              <h3>{{ it.title }}</h3>
              <div class="sub">Author: {{ it.authorEmail }} • {{ it.year || '—' }}</div>
            </div>
            <div class="actions">
              <select v-model="it.status">
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <button class="btn" @click="setStatus(it, it.status)">Apply</button>
              <button class="btn" @click="startEdit(it)" v-if="!it.editing">Edit</button>
              <button class="btn danger" @click="remove(it)">Delete</button>
            </div>
          </div>
          <div class="body" v-if="!it.editing">
            <p>{{ it.abstract }}</p>
          </div>
          <div class="editor" v-else>
            <label>
              <span>Title</span>
              <input type="text" v-model="it.title" />
            </label>
            <label>
              <span>Abstract</span>
              <textarea rows="4" v-model="it.abstract"></textarea>
            </label>
            <div class="row">
              <label>
                <span>Year</span>
                <input type="number" v-model="it.year" min="1900" max="2100" />
              </label>
              <div class="actions">
                <button class="btn" @click="cancelEdit(it)">Cancel</button>
                <button class="btn primary" @click="saveEdit(it)">Save</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p v-else class="muted">No papers to moderate</p>
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
  max-width: 1000px;
  margin: auto;
  display: grid;
  gap: var(--space-4);
}
.muted {
  color: var(--color-muted);
  margin: 0;
}
.list {
  display: grid;
  gap: var(--space-3);
}
.card {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: var(--space-3);
  display: grid;
  gap: var(--space-3);
}
.row {
  display: flex;
  gap: var(--space-2);
  align-items: center;
  justify-content: space-between;
}
.head .meta h3 {
  margin: 0;
}
.sub {
  color: var(--color-muted);
  font-size: 0.9rem;
}
.body p {
  margin: 0;
}
.editor {
  display: grid;
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
input[type='number'],
textarea {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-surface);
  color: var(--color-text);
}
.actions {
  display: inline-flex;
  gap: var(--space-2);
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
.btn.danger {
  background: var(--color-danger);
  border-color: var(--color-danger);
  color: #fff;
}
select {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
}
</style>
