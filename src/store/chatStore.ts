import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChatMessage } from '@/types'
import { makeSeedChat } from '@/data/seed'
import { seedPets } from '@/data/seed'
import { usePetStore } from '@/store/petStore'
import { doctorReply } from '@/lib/aiDoctor'
import { chatWithLLM, isLLMConfigured } from '@/lib/llm'

interface ChatState {
  /** petId → 该宠物的问诊对话 */
  byPet: Record<string, ChatMessage[]>
  sending: boolean
  send: (text: string) => Promise<void>
  append: (m: Omit<ChatMessage, 'id' | 'createdAt'>) => void
  reset: () => void
}

function seedAll(): Record<string, ChatMessage[]> {
  const map: Record<string, ChatMessage[]> = {}
  seedPets.forEach((p) => { map[p.id] = makeSeedChat(p.name) })
  return map
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      byPet: seedAll(),
      sending: false,
      send: async (text) => {
        if (!text.trim()) return
        const cur = usePetStore.getState()
        const pet = cur.pets.find((p) => p.id === cur.currentId) ?? cur.pets[0]
        const u: ChatMessage = {
          id: `m${Date.now()}`,
          role: 'user',
          content: text.trim(),
          createdAt: Date.now(),
        }
        set((s) => {
          const list = s.byPet[pet.id] ?? []
          return { byPet: { ...s.byPet, [pet.id]: [...list, u] }, sending: true }
        })
        // 思考延迟：LLM 模式更短（模型自身有延迟），兜底模式保留节奏感
        await new Promise((r) => setTimeout(r, isLLMConfigured() ? 300 : 650 + Math.random() * 500))
        let reply: string
        try {
          const history = (get().byPet[pet.id] ?? []).map((m) => ({ role: m.role, content: m.content }))
          reply = await chatWithLLM(history, pet.name)
        } catch {
          // 未配置 key / 网络失败 → 回落规则兜底，保证始终有回答
          reply = doctorReply(text, get().byPet[pet.id] ?? [], pet.name)
        }
        const d: ChatMessage = {
          id: `m${Date.now() + 1}`,
          role: 'doctor',
          content: reply,
          createdAt: Date.now(),
        }
        set((s) => {
          const list = s.byPet[pet.id] ?? []
          return { byPet: { ...s.byPet, [pet.id]: [...list, d] }, sending: false }
        })
      },
      append: (m) =>
        set((s) => {
          const id = usePetStore.getState().currentId
          const list = s.byPet[id] ?? []
          return {
            byPet: { ...s.byPet, [id]: [...list, { ...m, id: `m${Date.now()}${Math.random()}`, createdAt: Date.now() }] },
          }
        }),
      reset: () =>
        set((s) => {
          const id = usePetStore.getState().currentId
          const pet = usePetStore.getState().pets.find((p) => p.id === id)
          return { byPet: { ...s.byPet, [id]: makeSeedChat(pet?.name ?? '宠物') } }
        }),
    }),
    { name: 'petcare-chat-v2' },
  ),
)
