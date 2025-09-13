<script setup lang="ts">
import LeftTab from '@/components/LeftTab.vue'
import UpTab from '@/components/UpTab.vue'
import { useAuthStore } from '@/stores/authStore'
import { useRoute, useRouter } from 'vue-router'
const router = useRouter()
const AuthStore = useAuthStore()
if (!AuthStore.isAuthenticated) {
  router.replace('/auth')
}
</script>
<template>
  <!-- !Need some funcs for choose needed func -->
  <UpTab :show-menu="false" :show-upload="false" />
  <LeftTab />
  <div>Profile</div>
</template>
