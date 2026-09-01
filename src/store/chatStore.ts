import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChatMessage } from '@/types'
import { seedChat } from '@/data/seed'
import { doctorReply } from '@/lib/aiDoctor'

interface ChatState {
  messages: ChatMessage[]
  sending: boolean
  send: (text: string) => Promise<void>
  append: (m: Omit<ChatMessage, 'id' | 'createdAt'>) => void
  reset: () => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: seedChat,
      sending: false,
      send: async (text) => {
        if (!text.trim()) return
        const u: ChatMessage = {
          id: `m${Date.now()}`,
          role: 'user',
          content: text.trim(),
          createdAt: Date.now(),
        }
        set((s) => ({ messages: [...s.messages, u], sending: true }))
        // 模拟思考延迟
        await new Promise((r) => setTimeout(r, 650 + Math.random() * 500))
        const reply = doctorReply(text, get().messages)
        const d: ChatMessage = {
          id: `m${Date.now() + 1}`,
          role: 'doctor',
          content: reply,
          createdAt: Date.now(),
        }
        set((s) => ({ messages: [...s.messages, d], sending: false }))
      },
      append: (m) =>
        set((s) => ({
          messages: [...s.messages, { ...m, id: `m${Date.now()}${Math.random()}`, createdAt: Date.now() }],
        })),
      reset: () => set({ messages: seedChat }),
    }),
    { name: 'petcare-chat' },
  ),
)
