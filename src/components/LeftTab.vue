<script lang="ts" setup>
import { ref } from 'vue'
const leftTabHidden = ref(false)
function toggleLeftTab() {
  leftTabHidden.value = !leftTabHidden.value
}
</script>
<template>
  <div class="left-tab" :class="{ hidden: leftTabHidden }">
    <div class="header" :class="{ hidden: leftTabHidden }">
      <button class="btn btn-icon" aria-label="Home">
        <img src="/src/assets/book-logo.svg" alt="L" class="logo" />
      </button>
      <button class="btn btn-icon" @click="toggleLeftTab" aria-label="Toggle sidebar">
        {{ leftTabHidden ? '→' : '←' }}
      </button>
    </div>
    <div class="menu">
      <button class="btn-menu btn">
        <div class="icon-text">
          <img src="/src/assets/plus-line-icon.svg" alt="" class="logo" />
          <Transition name="text-fade"><p v-if="!leftTabHidden">New search</p></Transition>
        </div>
      </button>
      <button class="btn-menu btn">
        <div class="icon-text">
          <img src="/src/assets/search-icon.svg" alt="" class="logo" />
          <Transition name="text-fade"><p v-if="!leftTabHidden">Search chats</p></Transition>
        </div>
      </button>
    </div>
    <Transition name="menu-fade">
      <div class="menu" v-if="!leftTabHidden">
        <label for="menu" class="label">History</label>
        <button class="btn-menu btn">Search 1</button>
        <button class="btn-menu btn">Search 2</button>
        <button class="btn-menu btn">Search 3</button>
        <button class="btn-menu btn">Search 4</button>
      </div>
    </Transition>
  </div>
</template>
<style lang="css" scoped>
.left-tab {
  width: 250px;
  height: 100vh;
  background-color: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border);
  border-bottom-right-radius: 25px;
  border-top-right-radius: 25px;
  padding: 15px 5px;
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

/* Transitions for delayed appearance */
.text-fade-enter-active {
  transition: opacity var(--transition-base) ease, transform var(--transition-base) ease;
  transition-delay: 120ms; /* delay only on show */
}
.text-fade-leave-active {
  transition: none; /* hide instantly */
}
.text-fade-enter-from,
.text-fade-leave-to { opacity: 0; transform: translateY(-2px); }

.menu-fade-enter-active {
  transition: opacity var(--transition-slow) ease, transform var(--transition-slow) ease;
  transition-delay: 150ms; /* delay only on show */
}
.menu-fade-leave-active {
  transition: none; /* hide instantly */
}
.menu-fade-enter-from,
.menu-fade-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
