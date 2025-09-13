<script setup lang="ts">
import LeftTab from '@/components/LeftTab.vue'
import UpTab from '@/components/UpTab.vue'
import MainChat from '@/components/MainChat.vue'
import FooterTab from '@/components/FooterTab.vue'
</script>
<template>
  <div>
    <UpTab :show-menu="true" :show-upload="true" />
    <MainChat />
    <LeftTab />
    <FooterTab />
  </div>
</template>
