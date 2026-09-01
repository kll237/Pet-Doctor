import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AIAnalysisRecord } from '@/types'
import { seedAnalyses } from '@/data/seed'

interface AnalysisState {
  records: AIAnalysisRecord[]
  add: (r: Omit<AIAnalysisRecord, 'id'>) => void
  remove: (id: string) => void
  clear: () => void
}

export const useAnalysisStore = create<AnalysisState>()(
  persist(
    (set) => ({
      records: seedAnalyses,
      add: (r) =>
        set((s) => ({
          records: [
            { ...r, id: `a${Date.now()}` },
            ...s.records,
          ],
        })),
      remove: (id) => set((s) => ({ records: s.records.filter((r) => r.id !== id) })),
      clear: () => set({ records: [] }),
    }),
    { name: 'petcare-ai' },
  ),
)
