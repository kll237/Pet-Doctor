import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import dayjs from 'dayjs'

export type MessageKind = 'doctor' | 'risk' | 'system' | 'remind'

export interface AppMessage {
  id: string
  /** 消息类型：医生回复 / 健康预警 / 系统通知 / 复查提醒 */
  kind: MessageKind
  title: string
  body: string
  /** ISO 日期 YYYY-MM-DD HH:mm */
  date: string
  /** 是否已读 */
  read: boolean
  /** 点击跳转路径（可选） */
  to?: string
}

/** 默认种子消息（首次进入时初始化一次） */
const seedMessages: AppMessage[] = [
  {
    id: 'm-seed-1',
    kind: 'doctor',
    title: '猫宁医生已回复',
    body: '布丁今天的健康评分 86 分，整体状态良好。建议保持每日 80ml 饮水摄入。',
    date: dayjs().subtract(12, 'minute').format('YYYY-MM-DD HH:mm'),
    read: false,
    to: '/summary',
  },
  {
    id: 'm-seed-2',
    kind: 'risk',
    title: '健康风险提示',
    body: '布丁近 3 天饮水量偏低，注意补充水分，避免夏季中暑。',
    date: dayjs().subtract(2, 'hour').format('YYYY-MM-DD HH:mm'),
    read: false,
    to: '/log',
  },
  {
    id: 'm-seed-3',
    kind: 'remind',
    title: '疫苗接种提醒',
    body: '布丁下次疫苗（猫三联加强）将于 9 月 15 日到期，记得提前预约。',
    date: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm'),
    read: false,
  },
  {
    id: 'm-seed-4',
    kind: 'system',
    title: '本周健康总结已生成',
    body: '糯米本周共记录 6 次，整体评分上升 4 分，可前往查看。',
    date: dayjs().subtract(2, 'day').format('YYYY-MM-DD HH:mm'),
    read: true,
    to: '/trend',
  },
]

interface MessagesState {
  messages: AppMessage[]
  unread: () => number
  markRead: (id: string) => void
  markAllRead: () => void
  add: (m: Omit<AppMessage, 'id' | 'date' | 'read'> & { date?: string; read?: boolean }) => void
  remove: (id: string) => void
  /** 是否已注入种子（首次持久化） */
  _seeded: boolean
}

export const useMessagesStore = create<MessagesState>()(
  persist(
    (set, get) => ({
      messages: seedMessages,
      _seeded: false,

      unread: () => get().messages.filter((m) => !m.read).length,

      markRead: (id) =>
        set((s) => ({ messages: s.messages.map((m) => (m.id === id ? { ...m, read: true } : m)) })),

      markAllRead: () => set((s) => ({ messages: s.messages.map((m) => ({ ...m, read: true })) })),

      add: (m) =>
        set((s) => ({
          messages: [
            {
              id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              date: m.date ?? dayjs().format('YYYY-MM-DD HH:mm'),
              read: m.read ?? false,
              ...m,
            },
            ...s.messages,
          ],
        })),

      remove: (id) => set((s) => ({ messages: s.messages.filter((m) => m.id !== id) })),
    }),
    {
      name: 'petcare-messages-v1',
      // 首次持久化时强制覆盖种子（保证新用户看到示例消息）
      onRehydrateStorage: () => (state) => {
        if (!state) return
        if (!state._seeded) {
          state.messages = seedMessages
          state._seeded = true
        }
      },
    },
  ),
)
