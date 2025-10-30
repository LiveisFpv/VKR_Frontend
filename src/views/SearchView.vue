<script setup lang="ts">
import UpTab from '@/components/UpTab.vue'
import LeftTab from '@/components/LeftTab.vue'
import { useI18n } from '@/i18n'
const { t } = useI18n()
</script>

<template>
  <UpTab :show-menu="false" :show-upload="false" />
  <LeftTab />
  <div style="padding: 80px 20px 20px 320px;">
    <h2>{{ t('search.title') }}</h2>
    <p>{{ t('search.placeholder') }}</p>
  </div>
  
</template>

<style scoped>
</style>
