<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import UpTab from '@/components/UpTab.vue'
import LeftTab from '@/components/LeftTab.vue'
import { useSettingStore } from '@/stores/settingStore'

type Theme = 'light' | 'dark'
const THEME_KEY = 'theme'

const setting = useSettingStore()
const leftHidden = computed(() => setting.LeftTabHidden)

const theme = ref<Theme>('dark')

function readSavedTheme(): Theme | null {
  try {
    const t = localStorage.getItem(THEME_KEY)
    return t === 'light' || t === 'dark' ? t : null
  } catch {
    return null
  }
}
function applyTheme(t: Theme) {
  try {
    if (typeof (window as any).__setTheme === 'function') {
      ;(window as any).__setTheme(t)
    } else {
      document.documentElement.dataset.theme = t
      localStorage.setItem(THEME_KEY, t)
    }
  } catch {
    document.documentElement.dataset.theme = t
  }
}
function setTheme(t: Theme) {
  theme.value = t
  applyTheme(t)
}

onMounted(() => {
  const current: Theme =
    (document.documentElement.dataset.theme as Theme) || readSavedTheme() || 'dark'
  theme.value = current
})

function toggleLeftTab() {
  setting.HideLeftTab()
}
</script>

<template>
  <UpTab :show-menu="false" :show-upload="false" />
  <LeftTab :hidden="true" />

  <div class="settings-area" :class="{ collapsed: true }">
    <div class="container">
      <h2>Settings</h2>

      <section class="card">
        <h3>Appearance</h3>
        <div class="row">
          <label class="option">
            <input
              type="radio"
              name="theme"
              value="dark"
              v-model="theme"
              @change="setTheme('dark')"
            />
            <span>Dark theme</span>
          </label>
          <label class="option">
            <input
              type="radio"
              name="theme"
              value="light"
              v-model="theme"
              @change="setTheme('light')"
            />
            <span>Light theme</span>
          </label>
        </div>
      </section>

      <section class="card">
        <h3>Sidebar</h3>
        <div class="row">
          <label class="switch">
            <input type="checkbox" :checked="leftHidden" @change="toggleLeftTab" />
            <span>Hide left panel</span>
          </label>
        </div>
      </section>

      <section class="card">
        <h3>Language</h3>
        <p class="muted">Coming soon: interface language selector.</p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.settings-area {
  position: fixed;
  inset: 60px 20px 20px 310px;
  transition: all var(--transition-slow) ease;
}
.settings-area.collapsed {
  inset: 60px 20px 20px 120px;
}
.container {
  max-width: 800px;
  margin: auto;
  display: grid;
  gap: var(--space-4);
}
.card {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: var(--space-4);
  display: grid;
  gap: var(--space-3);
}
.row {
  display: flex;
  gap: var(--space-4);
  align-items: center;
  flex-wrap: wrap;
}
.option {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}
.switch {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}
.muted {
  color: var(--color-muted);
  margin: 0;
}
input[type='radio'],
input[type='checkbox'] {
  width: 16px;
  height: 16px;
}
</style>
