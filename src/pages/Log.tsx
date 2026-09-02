import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { useLogStore } from '@/store/logStore'
import { usePetStore, useCurrentPet } from '@/store/petStore'
import { useUIStore } from '@/store/uiStore'

/**
 * 每日日志 - 严格对齐原型图：
 * - 左返回 / 中标题 / 右日历图标
 * - 5 月周历（18-24）
 * - 今日记录概览（橙色进度条 + 去补全）
 * - 5 个状态项卡片（圆形彩色图标 + 标题 + 描述 + 状态 pill）
 * - 底部大橙色 "记录今日状态" 按钮
 */
export default function LogPage() {
  const nav = useNavigate()
  const currentId = usePetStore((s) => s.currentId)
  const logs = useLogStore((s) => s.byPet[currentId] ?? {})
  const pet = useCurrentPet()
  const { openSheet } = useUIStore()
  const [selectedDate, setSelectedDate] = useState(dayjs('2024-05-22').format('YYYY-MM-DD'))

  const days = useMemo(
    () => Array.from({ length: 7 }).map((_, i) => dayjs('2024-05-18').add(i, 'day')),
    [],
  )

  const today = dayjs().format('YYYY-MM-DD')
  const cur = logs[selectedDate] ?? logs[today] ?? null

  const itemsCount = 5
  const completed = cur ? itemsCount : 0

  const items: {
    icon: React.ReactNode
    iconBg: string
    title: string
    sub: string
    tag: string
    severity: 'ok' | 'warn' | 'alert'
    sheet: 'energy' | 'appetite' | 'stool' | 'eyes' | 'vomit'
  }[] = cur
    ? [
        { icon: <CatIcon />,   iconBg: 'bg-brand-50',  title: '精神与行为', sub: cur.energy.description,   tag: severityText(cur.energy.severity),   severity: cur.energy.severity,   sheet: 'energy' },
        { icon: <FoodIcon />,  iconBg: 'bg-info/10',   title: '食欲 & 饮水', sub: `食欲 ${cur.appetite.description}，饮水量 ${cur.water.description}`, tag: severityText(cur.water.severity), severity: cur.water.severity, sheet: 'appetite' },
        { icon: <PooIcon />,   iconBg: 'bg-warn/10',   title: '排泄情况',   sub: `${cur.stool.description}，${cur.urine.description}`, tag: severityText(cur.stool.severity), severity: cur.stool.severity, sheet: 'stool' },
        { icon: <CoatIcon />,  iconBg: 'bg-rose-50',   title: '五官 & 皮肤', sub: cur.coat.description,     tag: severityText(cur.coat.severity),   severity: cur.coat.severity,   sheet: 'eyes' },
        { icon: <WarnIcon />,  iconBg: 'bg-purple/10', title: '呕吐 & 其他', sub: cur.vomit.description,    tag: '无异常', severity: cur.vomit.severity, sheet: 'vomit' },
      ]
    : []

  return (
    <div className="px-4 pt-2 pb-24 bg-cream-50 min-h-full">
      {/* 顶部 */}
      <div className="flex items-center justify-between">
        <button onClick={() => nav(-1)} className="h-9 w-9 rounded-full bg-white shadow-card grid place-items-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#3F392F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div className="text-base font-semibold">每日日志</div>
        <button onClick={() => openSheet('summary', selectedDate)} className="h-9 w-9 rounded-full bg-white shadow-card grid place-items-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="5" width="18" height="16" rx="2" stroke="#3F392F" strokeWidth="1.6" />
            <path d="M3 9h18M8 3v4M16 3v4" stroke="#3F392F" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* 日历（5月 18-24） */}
      <div className="mt-3 rounded-3xl bg-white shadow-card px-3 py-3.5">
        <div className="px-2 flex items-center justify-between">
          <div className="text-sm font-semibold">5月</div>
          <div className="flex gap-1.5">
            <button className="h-6 w-6 rounded-full bg-cream-100 grid place-items-center text-xs text-ink-500">‹</button>
            <button className="h-6 w-6 rounded-full bg-cream-100 grid place-items-center text-xs text-ink-500">›</button>
          </div>
        </div>
        <div className="mt-2.5 grid grid-cols-7 gap-1 text-center">
          {['日', '一', '二', '三', '四', '五', '六'].map((w) => (
            <div key={w} className="text-[10px] text-ink-400 pb-0.5">{w}</div>
          ))}
          {days.map((d) => {
            const selected = d.format('YYYY-MM-DD') === selectedDate
            return (
              <button
                key={d.toString()}
                onClick={() => setSelectedDate(d.format('YYYY-MM-DD'))}
                className={`h-9 rounded-xl grid place-items-center text-xs ${selected ? 'bg-brand-500 text-white font-semibold' : 'text-ink-700'}`}
              >
                {d.date()}
              </button>
            )
          })}
        </div>
      </div>

      {/* 今日记录概览（橙色进度条 + 去补全） */}
      <div className="mt-3 rounded-3xl bg-white shadow-card px-4 py-3.5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-warn text-sm">★</span>
              <div className="text-sm font-semibold">今日记录概览</div>
            </div>
            <div className="text-[11px] text-ink-400 mt-0.5">已记录 {completed}/{itemsCount} 项</div>
          </div>
          <button
            onClick={() => openSheet('summary', selectedDate)}
            className="rounded-2xl bg-cream-100 px-3 py-1.5 text-xs text-ink-700"
          >
            去补全
          </button>
        </div>
        <div className="mt-2.5 h-1.5 rounded-full bg-cream-100 overflow-hidden">
          <div className="h-full bg-brand-500" style={{ width: `${(completed / itemsCount) * 100}%` }} />
        </div>
      </div>

      {/* 状态项列表 */}
      <div className="mt-3 space-y-2.5">
        {items.map((i) => (
          <button
            key={i.title}
            onClick={() => openSheet(i.sheet, selectedDate)}
            className="w-full rounded-2xl bg-white shadow-card px-3 py-3 flex items-center gap-3 active:scale-[0.99] transition-transform text-left"
          >
            <div className={`h-10 w-10 rounded-full ${i.iconBg} grid place-items-center shrink-0`}>{i.icon}</div>
            <div className="flex-1 min-w-0 leading-tight">
              <div className="text-sm font-semibold">{i.title}</div>
              <div className="text-[11px] text-ink-400 truncate mt-0.5">{i.sub}</div>
            </div>
            <div className={`pill ${i.severity === 'ok' ? 'status-ok' : i.severity === 'warn' ? 'status-warn' : 'status-alert'} shrink-0`}>{i.tag}</div>
          </button>
        ))}
      </div>

      {/* 底部大橙色 CTA */}
      <button
        onClick={() => openSheet('summary', selectedDate)}
        className="mt-4 w-full rounded-2xl bg-brand-500 py-3.5 text-white text-sm font-medium shadow-card flex items-center justify-center gap-1.5 active:scale-[0.98]"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.4" strokeLinecap="round"/></svg>
        记录今日状态
      </button>

      <div className="mt-2 text-center text-[11px] text-ink-400">{completed}/{itemsCount} 完成 · {pet.name}</div>
    </div>
  )
}

function severityText(s: 'ok' | 'warn' | 'alert') {
  return s === 'ok' ? '正常' : s === 'warn' ? '轻微减少' : '需就医'
}

// ===== 图标（统一彩色填充风格） =====
function CatIcon()  { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 9l2-4 4 3 1-1 1 1 4-3 2 4-1 6c0 2-2 4-5 4s-5-2-5-4l-1-6z" fill="#F4A12C"/><circle cx="9.5" cy="13" r="0.8" fill="#3F392F"/><circle cx="14.5" cy="13" r="0.8" fill="#3F392F"/></svg> }
function FoodIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 16c2 2 5 2 7 0s5-2 7 0 5 2 4-2c-1-3-3-5-9-5s-8 2-9 5c-1 4 1 4 0 2z" fill="#F4A12C"/><path d="M9 7c0-1 1-2 2-2" stroke="#F4A12C" strokeWidth="1.4" strokeLinecap="round"/></svg> }
function PooIcon()  { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 11c-2 0-3 2-3 4s1 4 3 4h6c2 0 3-2 3-4s-1-4-3-4c0-2-2-4-3-4s-3 2-3 4z" fill="#C28D53"/></svg> }
function CoatIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 4c-3 0-6 2-6 5 0 1 1 2 1 3s-1 2-1 3c0 3 3 5 6 5s6-2 6-5c0-1-1-2-1-3s1-2 1-3c0-3-3-5-6-5z" fill="#F25F4D"/></svg> }
function WarnIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 3l9 16H3l9-16z" fill="#9B7AE6"/><path d="M12 10v4M12 17v0.5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg> }
