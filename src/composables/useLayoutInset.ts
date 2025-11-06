import { computed } from 'vue'
import { useSettingStore } from '@/stores/settingStore'
import { storeToRefs } from 'pinia'

interface LayoutInsetOptions {
  expanded?: string
  collapsed?: string
}

export function useLayoutInset(options?: LayoutInsetOptions) {
  const settingStore = useSettingStore()
  const { LeftTabHidden } = storeToRefs(settingStore)
  const expanded = options?.expanded ?? '60px 20px 20px 310px'
  const collapsed = options?.collapsed ?? '60px 20px 20px 80px'

  const layoutInset = computed(() => (LeftTabHidden.value ? collapsed : expanded))

  return {
    LeftTabHidden,
    layoutInset,
  }
}

