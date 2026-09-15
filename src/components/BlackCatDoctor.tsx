import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useChatStore } from '@/store/chatStore'
import { useUIStore } from '@/store/uiStore'
import { usePetStore, useCurrentPet } from '@/store/petStore'
import { useLogStore } from '@/store/logStore'
import { suggestionsFor } from '@/lib/aiDoctor'
import { CATS } from '@/lib/cats'
import { PetAvatar } from '@/components/PetAvatar'

/**
 * 悬浮在右下角的猫宁医生入口：
 * - 圆形悬浮按钮（猫医生打招呼图），按钮右上角绿色"在线"点（避免与猫脸重叠）
 * - 旁边"问询猫宁医生"提示标签，带小三角尾巴像聊天气泡
 * - 点击展开全屏对话浮窗
 * - 对话末尾根据上下文插入"行动建议"卡：记录到今日日志 / 需要就医建议 / 预约复查提醒
 */
export default function BlackCatDoctor() {
  const { doctorOpen, setDoctorOpen, toggleDoctor, doctorPos, setDoctorPos } = useUIStore()
  const currentId = usePetStore((s) => s.currentId)
  const pet = useCurrentPet()
  const messages = useChatStore((s) => s.byPet[currentId] ?? [])
  const { sending, send } = useChatStore()
  const recomputeOverall = useLogStore((s) => s.recomputeOverall)
  const [input, setInput] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const nav = useNavigate()

  // ===== 悬浮按钮拖动（可移到屏幕任意位置，松手记忆）=====
  const SHELL_W = 390
  const NAV_H = 48
  const BTN = 72
  const [pos, setPos] = useState<{ x: number; y: number } | null>(doctorPos)
  const dragRef = useRef({ sx: 0, sy: 0, bx: 0, by: 0, moved: false })
  const onDragStart = (e: React.PointerEvent<HTMLButtonElement>) => {
    const shell = (e.currentTarget.closest('.phone-shell') as HTMLElement) ?? document.body
    const sr = shell.getBoundingClientRect()
    const r = e.currentTarget.getBoundingClientRect()
    dragRef.current = { sx: e.clientX, sy: e.clientY, bx: r.left - sr.left, by: r.top - sr.top, moved: false }
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }
  const onDragMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = dragRef.current
    if (!d.sx) return
    const dx = e.clientX - d.sx
    const dy = e.clientY - d.sy
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) d.moved = true
    let nx = d.bx + dx
    let ny = d.by + dy
    nx = Math.max(4, Math.min(nx, SHELL_W - BTN))
    ny = Math.max(56, Math.min(ny, 844 - NAV_H - BTN))
    setPos({ x: nx, y: ny })
  }
  const onDragEnd = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (pos) setDoctorPos(pos)
  }
  const onClickBtn = (e: React.MouseEvent) => {
    // 拖动过则不触发点开浮窗
    if (dragRef.current.moved) {
      e.stopPropagation()
      e.preventDefault()
      dragRef.current.moved = false
      return
    }
    toggleDoctor()
  }

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, doctorOpen, toast])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 1800)
    return () => clearTimeout(t)
  }, [toast])

  const onSend = async () => {
    if (!input.trim() || sending) return
    const txt = input
    setInput('')
    await send(txt)
  }

  const handleAction = async (kind: 'log' | 'medical' | 'remind') => {
    if (kind === 'log') {
      // 收尾对话 + 关闭浮窗 + 跳转到日志页（带状态携带）
      setDoctorOpen(false)
      nav('/log')
      return
    }
    if (kind === 'medical') {
      await send('请给我一份就医建议')
      return
    }
    if (kind === 'remind') {
      await send('帮我设置一个 7 天后的复查提醒')
      setToast('已请猫宁医生安排复查提醒')
    }
  }

  return (
    <>
      {/* 悬浮按钮（标签与按钮分离，带气泡尾巴） */}
      <AnimatePresence>
        {!doctorOpen && (
          <motion.button
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            onClick={onClickBtn}
            onPointerDown={onDragStart}
            onPointerMove={onDragMove}
            onPointerUp={onDragEnd}
            className={`abs z-50 flex items-end gap-1 touch-none select-none ${pos ? '' : 'right-3 bottom-[190px]'}`}
            style={pos ? { left: pos.x, top: pos.y } : undefined}
            aria-label="宠物医生"
          >
            {/* 标签（带小三角尾巴） */}
            <motion.span
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="relative mb-2 rounded-2xl bg-white px-3 py-1.5 shadow-float text-xs text-ink-700 whitespace-nowrap"
            >
              问询猫宁医生
              <span className="absolute -right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 rotate-45 bg-white shadow-[2px_-2px_2px_-2px_rgba(0,0,0,0.08)]" />
            </motion.span>
            {/* 圆头像（真实医生图，去掉背景圆避免看起来像两张猫叠在一起，整体放大） */}
            <span className="relative h-[68px] w-[68px] rounded-full bg-white shadow-float ring-2 ring-white grid place-items-center overflow-hidden">
              <PetAvatar
                src={CATS.doctorGreeting}
                alt="猫宁医生"
                className="h-full w-full"
                imgClassName="object-cover object-top"
              />
              {/* 绿色"在线"小圆点，放在右下角避开猫脸 */}
              <span className="absolute right-0.5 bottom-0.5 h-3 w-3 rounded-full bg-ok ring-2 ring-white" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* 对话浮窗 */}
      <AnimatePresence>
        {doctorOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 24, stiffness: 220 }}
            className="abs inset-0 z-50 flex flex-col bg-cream-50"
          >
            {/* 顶部 */}
            <div className="flex items-center justify-between border-b border-cream-200 bg-white px-4 py-3">
              <button onClick={() => setDoctorOpen(false)} className="text-ink-400 text-sm flex items-center gap-0.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                返回
              </button>
              <div className="text-center">
                <div className="text-base font-semibold">猫宁医生</div>
                <div className="text-xs text-ok flex items-center justify-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-ok inline-block" />在线
                </div>
              </div>
              <div className="w-12" />
            </div>

            {/* 医生信息 */}
            <div className="px-4 pt-4 pb-2 flex items-center gap-3">
              <PetAvatar
                src={CATS.doctorGreeting}
                alt="猫宁医生"
                className="h-12 w-12 rounded-2xl ring-2 ring-white shadow-card overflow-hidden bg-brand-100"
                imgClassName="object-cover"
              />
              <div className="flex-1">
                <div className="text-sm font-semibold">AI 宠物医生 · 猫宁医生</div>
                <div className="text-xs text-ink-400">基于日志 + 模型综合分析 · 仅供参考</div>
              </div>
            </div>

            {/* 消息列表 */}
            <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-hide">
              {messages.map((m) => (
                <Bubble key={m.id} role={m.role} content={m.content} />
              ))}

              {/* 行动建议卡：最后一条是医生回复且不在发送中时显示 */}
              {!sending && messages.length > 0 && messages[messages.length - 1].role === 'doctor' && (
                <ActionSuggestions onAct={handleAction} />
              )}

              {sending && (
                <div className="flex items-end gap-2">
                  <PetAvatar
                    src={CATS.doctorGreeting}
                    alt="猫宁医生"
                    className="h-8 w-8 rounded-full overflow-hidden bg-brand-100 shrink-0"
                    imgClassName="object-cover"
                  />
                  <div className="rounded-2xl bg-white px-3 py-2 shadow-card">
                    <Dots />
                  </div>
                </div>
              )}
            </div>

            {/* 推荐问题 */}
            <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
              {suggestionsFor(pet.name).map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="shrink-0 rounded-2xl bg-cream-100 px-3 py-1.5 text-xs text-ink-700 active:scale-95 transition-transform"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* 输入栏 */}
            <div className="border-t border-cream-200 bg-white p-3 flex items-center gap-2 pb-safe">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSend()}
                placeholder="输入想问的问题…"
                className="flex-1 rounded-2xl bg-cream-50 px-4 py-2.5 text-sm outline-none placeholder:text-ink-400"
              />
              <button
                onClick={onSend}
                disabled={sending}
                className="h-10 w-10 rounded-full bg-brand-500 text-white grid place-items-center shadow-card disabled:opacity-50 active:scale-95 transition-transform"
                aria-label="发送"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 轻提示 toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="abs left-1/2 -translate-x-1/2 bottom-24 z-[60] rounded-full bg-ink-900/85 text-white text-xs px-3.5 py-1.5 shadow-float"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/**
 * 对话末尾的"行动建议"卡片：
 * - 始终提供 3 个最常见动作：记录到今日日志 / 需要就医建议 / 预约复查提醒
 * - 用户点击后：记录到日志 → 关闭浮窗跳日志页；就医/提醒 → 触发一条对话消息让猫宁医生展开
 */
function ActionSuggestions({ onAct }: { onAct: (k: 'log' | 'medical' | 'remind') => void }) {
  const items: { key: 'log' | 'medical' | 'remind'; icon: React.ReactNode; title: string; sub: string; cls: string }[] = [
    {
      key: 'log',
      icon: <IconNote />,
      title: '记录到今日日志',
      sub: '把刚才的描述整理进当日记录',
      cls: 'bg-brand-50 text-brand-700',
    },
    {
      key: 'medical',
      icon: <IconStetho />,
      title: '需要就医建议',
      sub: '让医生判断是否需要去医院',
      cls: 'bg-warn/10 text-warn',
    },
    {
      key: 'remind',
      icon: <IconBell />,
      title: '预约复查提醒',
      sub: '设置 7 天后的复查提醒',
      cls: 'bg-info/10 text-info',
    },
  ]
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white border border-cream-200 shadow-card p-3 mt-1"
    >
      <div className="text-[11px] text-ink-400 mb-2 flex items-center gap-1">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-500" />
        需要我帮你做点什么？
      </div>
      <div className="space-y-2">
        {items.map((it) => (
          <button
            key={it.key}
            onClick={() => onAct(it.key)}
            className="w-full flex items-center gap-3 rounded-xl bg-cream-50 hover:bg-cream-100 px-3 py-2 active:scale-[0.99] transition-transform text-left"
          >
            <span className={`h-9 w-9 rounded-xl grid place-items-center ${it.cls}`}>{it.icon}</span>
            <div className="flex-1 leading-tight min-w-0">
              <div className="text-sm font-semibold text-ink-700">{it.title}</div>
              <div className="text-[11px] text-ink-400">{it.sub}</div>
            </div>
            <span className="text-ink-300 text-base">›</span>
          </button>
        ))}
      </div>
    </motion.div>
  )
}

function Bubble({ role, content }: { role: 'user' | 'doctor'; content: string }) {
  if (role === 'user') {
    return (
      <div className="flex items-end justify-end gap-2">
        <div className="max-w-[75%] rounded-2xl rounded-br-md bg-brand-500 px-3.5 py-2.5 text-sm text-white shadow-card leading-relaxed">
          {content}
        </div>
        <div className="h-8 w-8 rounded-full bg-cream-200 grid place-items-center text-[10px] text-ink-700 font-semibold shrink-0">
          我
        </div>
      </div>
    )
  }
  return (
    <div className="flex items-end gap-2">
      <PetAvatar
        src={CATS.doctorGreeting}
        alt="猫宁医生"
        className="h-8 w-8 rounded-full overflow-hidden bg-brand-100 shadow-card shrink-0"
        imgClassName="object-cover"
      />
      <div className="max-w-[78%] rounded-2xl rounded-bl-md bg-white px-3.5 py-2.5 text-sm text-ink-700 shadow-card whitespace-pre-wrap leading-relaxed">
        {content}
      </div>
    </div>
  )
}

function Dots() {
  return (
    <span className="inline-flex gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-ink-400"
          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  )
}

const IconNote = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
    <path d="M14 3v5h5M8 12h8M8 16h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
)
const IconStetho = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M5 3v6a4 4 0 0 0 8 0V3M7 3h4M9 13v3a4 4 0 0 0 8 0v-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="17" cy="12" r="2" stroke="currentColor" strokeWidth="1.6"/>
  </svg>
)
const IconBell = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M6 16V11a6 6 0 0 1 12 0v5l1 2H5l1-2zM10 21a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
  </svg>
)