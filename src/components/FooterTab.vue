<script lang="ts" setup>
import { useSettingStore } from '@/stores/settingStore'
import { useI18n } from '@/i18n'
const useSetting = useSettingStore()
const { t } = useI18n()
</script>
<template>
  <div class="footer" :class="{ collapsed: useSetting.LeftTabHidden }">
    <p>{{ t('footer.copy') }}</p>
  </div>
</template>
<style lang="css" scoped>
.footer {
  position: fixed;
  bottom: 0;
  left: 310px;
  right: 60px;
  height: 20px;
  font-size: x-small;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-slow) ease;
}
.footer.collapsed {
  left: 120px;
}
p {
  margin: 0;
}
</style>

