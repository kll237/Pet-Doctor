import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AIAnalysisRecord } from '@/types'
import { makeSeedAnalyses } from '@/data/seed'
import { seedPets } from '@/data/seed'
import { usePetStore } from '@/store/petStore'

interface AnalysisState {
  /** petId → 该宠物的 AI 分析记录 */
  byPet: Record<string, AIAnalysisRecord[]>
  add: (r: Omit<AIAnalysisRecord, 'id'>) => void
  remove: (id: string) => void
  clear: () => void
}

/** 为每只种子宠物生成初始分析记录 */
function seedAll(): Record<string, AIAnalysisRecord[]> {
  const map: Record<string, AIAnalysisRecord[]> = {}
  seedPets.forEach((p) => { map[p.id] = makeSeedAnalyses(p.name) })
  return map
}

export const useAnalysisStore = create<AnalysisState>()(
  persist(
    (set, get) => ({
      byPet: seedAll(),
      add: (r) =>
        set((s) => {
          const id = usePetStore.getState().currentId
          const list = s.byPet[id] ?? []
          return {
            byPet: { ...s.byPet, [id]: [{ ...r, id: `a${Date.now()}` }, ...list] },
          }
        }),
      remove: (id) =>
        set((s) => {
          const cur = usePetStore.getState().currentId
          const list = s.byPet[cur] ?? []
          return { byPet: { ...s.byPet, [cur]: list.filter((r) => r.id !== id) } }
        }),
      clear: () =>
        set((s) => {
          const cur = usePetStore.getState().currentId
          return { byPet: { ...s.byPet, [cur]: [] } }
        }),
    }),
    { name: 'petcare-ai-v2' },
  ),
)
