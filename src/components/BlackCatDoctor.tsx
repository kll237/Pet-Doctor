import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useChatStore } from '@/store/chatStore'
import { useUIStore } from '@/store/uiStore'
import { usePetStore, useCurrentPet } from '@/store/petStore'
import { suggestionsFor } from '@/lib/aiDoctor'
import BlackCat from './BlackCat'

/**
 * 悬浮在右下角的猫宁医生入口：
 * - 默认是圆形悬浮按钮 + "问询猫宁医生"提示标签
 * - 点击展开全屏对话浮窗
 * - 模拟大模型回复（生产可替换为真实 LLM API）
 */
export default function BlackCatDoctor() {
  const { doctorOpen, setDoctorOpen, toggleDoctor } = useUIStore()
  const currentId = usePetStore((s) => s.currentId)
  const pet = useCurrentPet()
  const messages = useChatStore((s) => s.byPet[currentId] ?? [])
  const { sending, send } = useChatStore()
  const [input, setInput] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, doctorOpen])

  const onSend = async () => {
    if (!input.trim() || sending) return
    const txt = input
    setInput('')
    await send(txt)
  }

  return (
    <>
      {/* 悬浮按钮 */}
      <AnimatePresence>
        {!doctorOpen && (
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            className="abs bottom-[88px] right-3 z-40 flex items-end gap-1.5"
          >
            {/* 标签 */}
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl bg-white px-3 py-1.5 shadow-float text-xs text-ink-700 mb-1"
            >
              问询猫宁医生
            </motion.div>
            {/* 圆头像 */}
            <button
              onClick={toggleDoctor}
              className="relative h-14 w-14 rounded-full bg-brand-100 shadow-float ring-2 ring-white/60 active:scale-95 transition-transform overflow-hidden"
              aria-label="宠物医生"
            >
              <BlackCat size={56} />
              <span className="absolute -top-1 -right-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-alert text-[10px] text-white shadow">…</span>
            </button>
          </motion.div>
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
              <div className="h-12 w-12 rounded-2xl bg-brand-100 ring-2 ring-white shadow-card overflow-hidden">
                <BlackCat size={48} />
              </div>
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
              {sending && (
                <div className="flex items-end gap-2">
                  <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center overflow-hidden">
                    <BlackCat size={32} />
                  </div>
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
    </>
  )
}

function Bubble({ role, content }: { role: 'user' | 'doctor'; content: string }) {
  if (role === 'user') {
    return (
      <div className="flex items-end justify-end gap-2">
        <div className="max-w-[75%] rounded-2xl rounded-br-md bg-brand-500 px-3.5 py-2.5 text-sm text-white shadow-card">
          {content}
        </div>
        <div className="h-8 w-8 rounded-full bg-cream-200 grid place-items-center text-xs">
          我
        </div>
      </div>
    )
  }
  return (
    <div className="flex items-end gap-2">
      <div className="h-8 w-8 rounded-full bg-brand-100 grid place-items-center overflow-hidden shadow-card">
        <BlackCat size={32} />
      </div>
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
