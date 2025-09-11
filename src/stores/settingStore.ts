import { ref } from 'vue'
import { defineStore } from 'pinia'
export const useSettingStore = defineStore('setting', () => {
  const LeftTabHidden = ref(false)
  const HideLeftTab = () => {
    LeftTabHidden.value = !LeftTabHidden.value
  }
  return { LeftTabHidden, HideLeftTab }
})
