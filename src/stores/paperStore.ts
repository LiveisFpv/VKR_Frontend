import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import type { AddPaperRequest } from '@/api/types'

export type PaperStatus = 'DRAFT' | 'PENDING' | 'REJECTED' | 'APPROVED'

export interface PaperSummary {
  id: string
  title: string
  status: PaperStatus
  updatedAt: string
  submittedAt?: string
  moderatorComment?: string
}

export interface PaperDetail extends PaperSummary {
  abstract?: string
  year?: number
  best_oa_location?: string
  related_paper?: { id: string }[]
  referenced_paper?: { id: string }[]
}

type PaperPayload = AddPaperRequest & {
  id?: string
  status?: PaperStatus
  moderatorComment?: string
}

const mockMyPapers = reactive<PaperDetail[]>([
  {
    id: 'mock-1',
    title: 'Explainable AI for Healthcare Diagnostics',
    abstract:
      'Survey of interpretable machine learning approaches for clinical decision support systems.',
    status: 'PENDING',
    submittedAt: '2025-09-01T08:15:00Z',
    updatedAt: '2025-09-04T12:20:00Z',
    year: 2024,
    best_oa_location: 'https://arxiv.org/abs/2401.12345',
    related_paper: [{ id: 'mock-ref-42' }],
    referenced_paper: [{ id: 'mock-cite-7' }],
  },
  {
    id: 'mock-2',
    title: 'Assessing Bias in Large Language Models',
    abstract:
      'Experimental study of prompt-based mitigation strategies for reducing bias in LLM outputs.',
    status: 'REJECTED',
    submittedAt: '2025-08-22T09:00:00Z',
    updatedAt: '2025-08-30T15:02:00Z',
    moderatorComment:
      'Please provide clearer evaluation metrics and expand the dataset description section.',
    year: 2023,
    best_oa_location: 'https://doi.org/10.1234/bias-llm',
    related_paper: [],
    referenced_paper: [{ id: 'mock-cite-19' }],
  },
  {
    id: 'mock-3',
    title: 'Graph Neural Networks for Traffic Forecasting',
    abstract: 'Benchmarking spatio-temporal GNN architectures on urban mobility datasets.',
    status: 'APPROVED',
    submittedAt: '2025-07-02T10:32:00Z',
    updatedAt: '2025-07-12T11:40:00Z',
    year: 2022,
    best_oa_location: 'https://openreview.net/pdf?id=mock-g-2022',
    related_paper: [],
    referenced_paper: [],
  },
])

export const usePaperStore = defineStore('paper', () => {
  const isLoading = ref(false)
  const lastLoaded = ref<string | null>(null)

  const papers = computed(() => mockMyPapers)

  const editablePaperIds = computed(() =>
    papers.value.filter((paper) => paper.status !== 'APPROVED').map((paper) => paper.id),
  )

  function canEdit(id: string) {
    return editablePaperIds.value.includes(id)
  }

  async function loadMyPapers() {
    if (isLoading.value) return
    isLoading.value = true
    try {
      await new Promise((resolve) => setTimeout(resolve, 120))
      lastLoaded.value = new Date().toISOString()
    } finally {
      isLoading.value = false
    }
  }

  function getMyPapers(): PaperSummary[] {
    return papers.value.map((paper) => ({
      id: paper.id,
      title: paper.title,
      status: paper.status,
      updatedAt: paper.updatedAt,
      submittedAt: paper.submittedAt,
      moderatorComment: paper.moderatorComment,
    }))
  }

  function getById(id: string) {
    return papers.value.find((paper) => paper.id === id)
  }

  function upsertLocalPaper(payload: PaperPayload) {
    const existing = payload.id ? getById(payload.id) : undefined
    if (existing) {
      existing.title = payload.title?.trim() || ''
      existing.abstract = payload.abstract?.trim()
      existing.year = payload.year
      existing.best_oa_location = payload.best_oa_location
      existing.related_paper = (payload.related_paper ?? []).map((item) => ({ id: item.id || '' }))
      existing.referenced_paper = (payload.referenced_paper ?? []).map((item) => ({
        id: item.id || '',
      }))
      existing.updatedAt = new Date().toISOString()
      existing.status = payload.status ?? existing.status
      existing.moderatorComment = payload.moderatorComment ?? existing.moderatorComment
      return existing.id
    }

    const newId = payload.id || `draft-${Date.now()}`
    mockMyPapers.unshift({
      id: newId,
      title: payload.title?.trim() || '',
      abstract: payload.abstract?.trim(),
      status: payload.status ?? 'DRAFT',
      submittedAt: payload.status === 'PENDING' ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
      year: payload.year,
      best_oa_location: payload.best_oa_location,
      related_paper: (payload.related_paper ?? []).map((item) => ({ id: item.id || '' })),
      referenced_paper: (payload.referenced_paper ?? []).map((item) => ({ id: item.id || '' })),
      moderatorComment: payload.moderatorComment,
    })
    return newId
  }

  async function savePaper(payload: PaperPayload) {
    await new Promise((resolve) => setTimeout(resolve, 150))
    return upsertLocalPaper(payload)
  }

  function resetForLogout() {
    mockMyPapers.splice(0, mockMyPapers.length)
    mockMyPapers.push(...[])
  }

  return {
    isLoading,
    lastLoaded,
    papers,
    editablePaperIds,
    canEdit,
    loadMyPapers,
    getMyPapers,
    getById,
    savePaper,
    resetForLogout,
  }
})

