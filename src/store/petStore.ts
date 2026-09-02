import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PetProfile } from '@/types'
import { seedPets, makePet } from '@/data/seed'

interface PetState {
  pets: PetProfile[]
  currentId: string
  setCurrentId: (id: string) => void
  addPet: (p: PetProfile) => void
  removePet: (id: string) => void
  updatePet: (patch: Partial<PetProfile>) => void
  setEnv: (patch: Partial<PetProfile['env']>) => void
  setHealth: (patch: Partial<PetProfile['health']>) => void
}

export const usePetStore = create<PetState>()(
  persist(
    (set, get) => ({
      pets: seedPets,
      currentId: seedPets[0].id,

      setCurrentId: (id) => set({ currentId: id }),

      addPet: (p) => set((s) => ({ pets: [...s.pets, p], currentId: p.id })),

      removePet: (id) =>
        set((s) => {
          if (s.pets.length <= 1) return s // 至少保留一只
          const pets = s.pets.filter((p) => p.id !== id)
          const currentId = s.currentId === id ? pets[0].id : s.currentId
          return { pets, currentId }
        }),

      updatePet: (patch) =>
        set((s) => ({
          pets: s.pets.map((p) => (p.id === s.currentId ? { ...p, ...patch } : p)),
        })),

      setEnv: (patch) =>
        set((s) => ({
          pets: s.pets.map((p) =>
            p.id === s.currentId ? { ...p, env: { ...p.env, ...patch } } : p,
          ),
        })),

      setHealth: (patch) =>
        set((s) => ({
          pets: s.pets.map((p) =>
            p.id === s.currentId ? { ...p, health: { ...p.health, ...patch } } : p,
          ),
        })),
    }),
    { name: 'petcare-pet-v2' },
  ),
)

/** 取当前选中的宠物（一定存在，兜底取第一只） */
export function useCurrentPet(): PetProfile {
  return usePetStore((s) => s.pets.find((p) => p.id === s.currentId) ?? s.pets[0])
}

export { makePet }
