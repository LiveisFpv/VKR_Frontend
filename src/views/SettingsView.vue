<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import UpTab from '@/components/UpTab.vue'
import LeftTab from '@/components/LeftTab.vue'
import { useSettingStore } from '@/stores/settingStore'
import { useI18n } from '@/i18n'

type Theme = 'light' | 'dark'
const THEME_KEY = 'theme'

const setting = useSettingStore()
const { locale, setLocale, t } = useI18n()
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

const currentLang = computed(() => locale.value)
function chooseLang(l: 'en' | 'ru') {
  setLocale(l)
}
</script>

<template>
  <UpTab :show-menu="false" :show-upload="false" />
  <LeftTab :hidden="true" />

  <div class="settings-area" :class="{ collapsed: true }">
    <div class="container">
      <h2>{{ t('settings.title') }}</h2>

      <section class="card">
        <h3>{{ t('settings.appearance') }}</h3>
        <div class="option-grid">
          <button
            type="button"
            class="option-card"
            :class="{ active: theme === 'dark' }"
            @click="setTheme('dark')"
          >
            <div class="option-visual theme theme-dark" aria-hidden="true"></div>
            <div class="option-text">
              <strong>{{ t('settings.dark') }}</strong>
            </div>
          </button>
          <button
            type="button"
            class="option-card"
            :class="{ active: theme === 'light' }"
            @click="setTheme('light')"
          >
            <div class="option-visual theme theme-light" aria-hidden="true"></div>
            <div class="option-text">
              <strong>{{ t('settings.light') }}</strong>
            </div>
          </button>
        </div>
      </section>

      <section class="card">
        <h3>{{ t('settings.sidebar') }}</h3>
        <div class="row">
          <div class="toggle">
            <input id="leftToggle" type="checkbox" :checked="leftHidden" @change="toggleLeftTab" />
            <label for="leftToggle" class="toggle-track">
              <span class="toggle-thumb"></span>
            </label>
            <span class="toggle-label">{{ t('settings.hideLeft') }}</span>
          </div>
        </div>
      </section>

      <section class="card">
        <h3>{{ t('settings.language') }}</h3>
        <div class="option-grid">
          <button
            type="button"
            class="option-card"
            :class="{ active: currentLang === 'en' }"
            @click="chooseLang('en')"
          >
            <div class="option-visual lang">EN</div>
            <div class="option-text">
              <strong>{{ t('settings.langEnglish') }}</strong>
            </div>
          </button>
          <button
            type="button"
            class="option-card"
            :class="{ active: currentLang === 'ru' }"
            @click="chooseLang('ru')"
          >
            <div class="option-visual lang">RU</div>
            <div class="option-text">
              <strong>{{ t('settings.langRussian') }}</strong>
            </div>
          </button>
        </div>
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
.option-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-3);
}
.option-card {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  border-radius: var(--radius-md);
  text-align: left;
  cursor: pointer;
  transition: transform var(--transition-fast) ease, box-shadow var(--transition-fast) ease, border-color var(--transition-fast) ease, background var(--transition-fast) ease;
}
.option-card:hover {
  border-color: var(--color-primary-secondary);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}
.option-card.active {
  border-color: var(--color-primary-secondary);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.1);
}
.option-visual.theme {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
}
.option-visual.theme-dark { background: #111; }
.option-visual.theme-light { background: #fff; }
.option-visual.lang {
  width: 38px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
  font-weight: 700;
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
/* segmented styles removed (replaced by option-cards) */
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
.toggle {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.toggle input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}
.toggle-track {
  width: 46px;
  height: 26px;
  background: var(--color-border);
  border-radius: 999px;
  position: relative;
  transition: background var(--transition-fast) ease;
  cursor: pointer;
}
.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-surface);
  box-shadow: 0 1px 3px rgba(0,0,0,0.25);
  transition: transform var(--transition-fast) ease;
}
.toggle input:checked + .toggle-track {
  background: var(--color-primary-secondary);
}
.toggle input:checked + .toggle-track .toggle-thumb {
  transform: translateX(20px);
}
.toggle-label { color: var(--color-text); }
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
