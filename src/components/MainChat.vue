<script setup lang="ts">
import { useSettingStore } from '@/stores/settingStore'
const useSetting = useSettingStore()
</script>
<template>
  <div class="chat" :class="{ collapsed: useSetting.LeftTabHidden }">
    <div class="main-chat" :class="{ collapsed: useSetting.LeftTabHidden }">
      <p>Main Area</p>
    </div>
    <div class="input-area">
      <input type="text" placeholder="Type your message..." />
      <button class="btn btn-icon">Send</button>
    </div>
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
  padding: 10px;
  transition: all var(--transition-slow) ease;
}
.chat.collapsed {
  left: 120px;
}
.main-chat {
  height: calc(100% - 45px);
  overflow-y: auto;
}
.input-area {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background-color: var(--color-bg);
  color: var(--color-text);
  display: flex;
  padding: 2.5px;
}
.input-area input {
  border: none;
  outline: none;
  background: transparent;
  flex: 1;
  padding: 10px;
}
</style>
