import { useNavigate } from 'react-router-dom'
import { useMessagesStore } from '@/store/messagesStore'
import type { AppMessage, MessageKind } from '@/store/messagesStore'

/**
 * 消息中心 - 真实消息列表：
 * - 顶部 Header（返回 + 全部已读）
 * - 按"今天 / 昨天 / 更早"分组
 * - 卡片左侧彩色图标（医生/预警/提醒/系统），右侧标题/正文/时间
 * - 未读消息：左侧蓝色色条 + 加粗标题
 * - 点击单条跳转 + 自动标已读
 * - 长按或左滑可删除（用右上 ✕ 按钮实现更稳）
 */
export default function MessagesPage() {
  const nav = useNavigate()
  const messages = useMessagesStore((s) => s.messages)
  const markRead = useMessagesStore((s) => s.markRead)
  const markAllRead = useMessagesStore((s) => s.markAllRead)
  const remove = useMessagesStore((s) => s.remove)

  const groups = groupByDay(messages)

  return (
    <div className="px-4 pt-2 pb-24 bg-cream-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => nav(-1)}
          className="h-9 w-9 rounded-full bg-white shadow-card grid place-items-center"
          aria-label="返回"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#3F392F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="text-base font-semibold">消息中心</div>
        <button
          onClick={markAllRead}
          className="text-xs text-brand-500 active:scale-95 px-2"
        >
          全部已读
        </button>
      </div>

      {/* 列表为空 */}
      {messages.length === 0 && (
        <div className="mt-20 text-center text-sm text-ink-400">暂无消息</div>
      )}

      {groups.map((g) => (
        <section key={g.label} className="mt-4">
          <div className="text-[11px] text-ink-400 mb-2 px-1">{g.label}</div>
          <div className="space-y-2">
            {g.items.map((m) => (
              <MessageItem
                key={m.id}
                m={m}
                onClick={() => {
                  markRead(m.id)
                  if (m.to) nav(m.to)
                }}
                onRemove={() => remove(m.id)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function MessageItem({
  m,
  onClick,
  onRemove,
}: {
  m: AppMessage
  onClick: () => void
  onRemove: () => void
}) {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        className={`w-full text-left rounded-2xl bg-white shadow-card px-3.5 py-3 flex gap-3 active:scale-[0.99] transition-transform ${m.read ? '' : 'ring-1 ring-brand-100'}`}
      >
        {/* 左侧彩色图标 */}
        <div className={`h-10 w-10 rounded-2xl grid place-items-center shrink-0 ${kindBg(m.kind)}`}>
          <KindIcon kind={m.kind} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className={`text-sm truncate ${m.read ? 'text-ink-700' : 'text-ink-900 font-semibold'}`}>
              {m.title}
            </div>
            {!m.read && <span className="h-2 w-2 rounded-full bg-brand-500 shrink-0" />}
          </div>
          <div className={`mt-0.5 text-[12px] line-clamp-2 ${m.read ? 'text-ink-400' : 'text-ink-500'}`}>{m.body}</div>
          <div className="mt-1 text-[10px] text-ink-300">{m.date}</div>
        </div>
      </button>
      {/* 删除按钮 */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        className="absolute right-1.5 top-1.5 h-6 w-6 grid place-items-center rounded-full bg-cream-100 text-ink-400 active:scale-90"
        aria-label="删除消息"
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}

function kindBg(kind: MessageKind) {
  if (kind === 'doctor') return 'bg-brand-50'
  if (kind === 'risk') return 'bg-warn/10'
  if (kind === 'remind') return 'bg-info/10'
  return 'bg-ok/10'
}

function KindIcon({ kind }: { kind: MessageKind }) {
  if (kind === 'doctor') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="13" r="7" fill="#F4A12C" />
        <circle cx="10" cy="13" r="1" fill="#fff" />
        <circle cx="14" cy="13" r="1" fill="#fff" />
        <path d="M5 9l1-3 3 2 1-2 1 2 3-2 1 3" fill="#F4A12C" />
        <path d="M9 17h6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    )
  }
  if (kind === 'risk') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 3l9 16H3z" fill="#F25F4D" />
        <path d="M12 10v4M12 17v0.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  }
  if (kind === 'remind') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" fill="#3FA7E5" />
        <path d="M12 7v5l3 2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" fill="#7CC25A" />
      <path d="M8 12l3 3 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** 按"今天 / 昨天 / 更早"分组 */
function groupByDay(list: AppMessage[]): { label: string; items: AppMessage[] }[] {
  const today = new Date().toISOString().slice(0, 10)
  const y = new Date(Date.now() - 86400e3).toISOString().slice(0, 10)
  const todayItems = list.filter((m) => m.date.slice(0, 10) === today)
  const yItems = list.filter((m) => m.date.slice(0, 10) === y)
  const older = list.filter((m) => m.date.slice(0, 10) !== today && m.date.slice(0, 10) !== y)
  return [
    { label: '今天', items: todayItems },
    { label: '昨天', items: yItems },
    { label: '更早', items: older },
  ].filter((g) => g.items.length > 0)
}
