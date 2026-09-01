import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PetProfile } from '@/types'
import { defaultPet } from '@/data/seed'

interface PetState {
  pet: PetProfile
  setPet: (patch: Partial<PetProfile>) => void
  setEnv: (patch: Partial<PetProfile['env']>) => void
  setHealth: (patch: Partial<PetProfile['health']>) => void
}

export const usePetStore = create<PetState>()(
  persist(
    (set) => ({
      pet: defaultPet,
      setPet: (patch) => set((s) => ({ pet: { ...s.pet, ...patch } })),
      setEnv: (patch) =>
        set((s) => ({ pet: { ...s.pet, env: { ...s.pet.env, ...patch } } })),
      setHealth: (patch) =>
        set((s) => ({ pet: { ...s.pet, health: { ...s.pet.health, ...patch } } })),
    }),
    { name: 'petcare-pet' },
  ),
)
