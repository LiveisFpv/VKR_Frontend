<script setup lang="ts">
import { useI18n } from '@/i18n'
const { t } = useI18n()
</script>
<template>
  <div class="not-found">
    <h1>{{ t('notFound.title') }}</h1>
    <p>{{ t('notFound.desc') }}</p>
    <a href="/">{{ t('notFound.home') }}</a>
  </div>
</template>
<style lang="css" scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
}
.not-found h1 {
  font-size: 4em;
  margin-bottom: 0.5em;
}
.not-found p {
  font-size: 1.5em;
  margin-bottom: 1em;
}
.not-found a {
  font-size: 1.2em;
  color: var(--color-primary);
  text-decoration: none;
}
.not-found a:hover {
  text-decoration: underline;
}
</style>
