import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { useLogStore } from '@/store/logStore'
import { usePetStore } from '@/store/petStore'
import { useUIStore } from '@/store/uiStore'

const TABS = ['全部', '精神行为', '饮食饮水', '排泄情况', '身体状况', '其他异常'] as const
type Tab = (typeof TABS)[number]

export default function LogPage() {
  const nav = useNavigate()
  const { logs } = useLogStore()
  const pet = usePetStore((s) => s.pet)
  const { openSheet } = useUIStore()
  const [tab, setTab] = useState<Tab>('全部')
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const today = dayjs()
  const [selectedDate, setSelectedDate] = useState(today.format('YYYY-MM-DD'))

  // 当前显示 5 月 18-24 的原型图日历
  const days = useMemo(
    () => Array.from({ length: 7 }).map((_, i) => dayjs('2024-05-18').add(i, 'day')),
    [],
  )

  const cur = logs[selectedDate] ?? logs[today.format('YYYY-MM-DD')] ?? null

  const itemsCount = 8
  const completed = cur ? itemsCount : 0
  const total = itemsCount

  const items: Array<{ icon: React.ReactNode; title: string; sub: string; tag: string; color: string; sheet?: any; severity: 'ok' | 'warn' | 'alert' }> = cur ? [
    { icon: <CatIcon />, title: '精神与行为', sub: cur.energy.description, tag: severityTextT(cur.energy.severity), color: sevColor(cur.energy.severity), sheet: 'energy', severity: cur.energy.severity },
    { icon: <FoodIcon />, title: '食欲 & 饮水', sub: cur.appetite.description, tag: severityTextT(cur.water.severity), color: sevColor(cur.water.severity), sheet: 'appetite', severity: cur.water.severity },
    { icon: <PooIcon />, title: '排泄情况', sub: `${cur.stool.description}，${cur.urine.description}`, tag: severityTextT(cur.stool.severity), color: sevColor(cur.stool.severity), sheet: 'stool', severity: cur.stool.severity },
    { icon: <EyeIcon />, title: '五官 & 皮肤', sub: cur.coat.description, tag: severityTextT(cur.coat.severity), color: sevColor(cur.coat.severity), sheet: 'eyes', severity: cur.coat.severity },
    { icon: <WarnIcon />, title: '呕吐 & 其他', sub: cur.vomit.description, tag: '无异常', color: 'ok', sheet: 'vomit', severity: cur.vomit.severity },
    { icon: <TempIcon />, title: '体温情况', sub: cur.temperature.description, tag: '已记录', color: 'ok', sheet: 'temperature', severity: cur.temperature.severity },
    { icon: <BowlIcon />, title: '饮食喂养记录', sub: cur.feedingNote || '未填写', tag: cur.feedingNote ? '已记录' : '待补充', color: cur.feedingNote ? 'ok' : 'warn', sheet: 'feeding', severity: cur.feedingNote ? 'ok' : 'warn' },
    { icon: <DocIcon />, title: '总结判断', sub: cur.summary.description, tag: '已完成', color: 'ok', sheet: 'summary', severity: cur.summary.severity },
  ] : []

  const filtered = items.filter((i) => {
    if (tab === '全部') return true
    if (tab === '精神行为') return i.sheet === 'energy'
    if (tab === '饮食饮水') return ['appetite', 'feeding'].includes(i.sheet)
    if (tab === '排泄情况') return i.sheet === 'stool'
    if (tab === '身体状况') return ['eyes', 'temperature'].includes(i.sheet)
    if (tab === '其他异常') return ['vomit', 'summary'].includes(i.sheet)
    return true
  })

  return (
    <div className="px-4 pt-2 pb-24 bg-cream-50 min-h-full">
      {/* 顶部 */}
      <div className="flex items-center justify-between">
        <button onClick={() => nav(-1)} className="h-9 w-9 rounded-full bg-white shadow-card grid place-items-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#3F392F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div className="text-lg font-semibold">每日日志</div>
        <button onClick={() => setView((v) => v === 'list' ? 'calendar' : 'list')} className="rounded-full bg-brand-50 px-3 py-1.5 text-xs text-brand-500">
          {view === 'list' ? '日历视图' : '列表视图'}
        </button>
      </div>
      <div className="mt-2 text-sm text-ink-500">记录{pet.name}的每日健康状态</div>

      {/* 日历 */}
      <div className="mt-3 rounded-3xl bg-white shadow-card px-3 py-4">
        <div className="px-2 flex items-center justify-between">
          <button className="h-7 w-7 rounded-full bg-cream-100 grid place-items-center">‹</button>
          <div className="text-sm font-semibold">5月</div>
          <button className="h-7 w-7 rounded-full bg-cream-100 grid place-items-center">›</button>
        </div>
        <div className="mt-3 grid grid-cols-7 gap-1 text-center">
          {['日','一','二','三','四','五','六'].map((w) => (
            <div key={w} className="text-[11px] text-ink-400 pb-1">{w}</div>
          ))}
          {days.map((d) => {
            const selected = d.format('YYYY-MM-DD') === selectedDate
            return (
              <button
                key={d.toString()}
                onClick={() => setSelectedDate(d.format('YYYY-MM-DD'))}
                className={`h-9 rounded-xl grid place-items-center text-sm ${selected ? 'bg-brand-500 text-white font-semibold' : ''}`}
              >
                <div>{d.date()}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 今日记录概览 */}
      <div className="mt-4 rounded-3xl bg-white shadow-card px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-warn text-base">★</span>
              <div className="text-sm font-semibold">今日记录概览</div>
            </div>
            <div className="text-xs text-ink-400 mt-1">已记录 {completed}/{total} 项</div>
          </div>
          <button
            onClick={() => openSheet('summary', selectedDate)}
            className="rounded-2xl bg-cream-100 px-3 py-1.5 text-xs text-ink-700"
          >
            去补充记录
          </button>
        </div>
        <div className="mt-2 h-2 rounded-full bg-cream-100 overflow-hidden">
          <div className="h-full bg-brand-500" style={{ width: `${(completed / total) * 100}%` }} />
        </div>
      </div>

      {/* Tab 切换 */}
      <div className="mt-4 flex gap-2 overflow-x-auto scrollbar-hide">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`shrink-0 px-3 py-1.5 text-xs rounded-full ${tab === t ? 'bg-ink-900 text-white' : 'bg-white text-ink-700'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* 列表 */}
      <div className="mt-3 space-y-2.5">
        {filtered.map((i) => (
          <button
            key={i.title}
            onClick={() => i.sheet && openSheet(i.sheet, selectedDate)}
            className="w-full rounded-2xl bg-white shadow-card px-3 py-3 flex items-center gap-3 active:scale-[0.99] transition-transform text-left"
          >
            <div className="h-9 w-9 rounded-2xl bg-cream-100 grid place-items-center">{i.icon}</div>
            <div className="flex-1 min-w-0 leading-tight">
              <div className="text-sm font-semibold">{i.title}</div>
              <div className="text-xs text-ink-400 truncate mt-0.5">{i.sub}</div>
            </div>
            <div className={`text-xs ${colorText(i.severity)}`}>{i.tag}</div>
            <div className="text-ink-300">›</div>
          </button>
        ))}
      </div>

      {/* 大 CTA */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <button
          onClick={() => openSheet('summary', selectedDate)}
          className="col-span-2 rounded-2xl bg-brand-500 py-3 text-white font-medium shadow-card flex items-center justify-center gap-1 active:scale-[0.98]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.4" strokeLinecap="round"/></svg>
          记录今日状态
        </button>
        <button
          onClick={() => openSheet('energy', selectedDate)}
          className="rounded-2xl bg-white shadow-card py-3 text-sm font-medium text-ink-700 inline-flex items-center justify-center gap-1 active:scale-[0.98]"
        >
          <span className="text-warn">📷</span> 快速记录
        </button>
      </div>

      {/* 完成度提示 */}
      <div className="mt-3 text-center text-xs text-ink-400">{completed}/{total} 完成</div>
    </div>
  )
}

function severityTextT(s: 'ok' | 'warn' | 'alert') {
  return s === 'ok' ? '正常' : s === 'warn' ? '轻微减少' : '需就医'
}
function sevColor(s: 'ok' | 'warn' | 'alert') {
  return s === 'ok' ? 'ok' : s === 'warn' ? 'warn' : 'alert'
}
function colorText(s: 'ok' | 'warn' | 'alert') {
  return s === 'ok' ? 'text-ok' : s === 'warn' ? 'text-warn' : 'text-alert'
}

// 图标
function CatIcon() { return <span className="text-warn text-lg">🐱</span> }
function FoodIcon() { return <span className="text-info text-lg">🍚</span> }
function PooIcon() { return <span className="text-amber-700 text-lg">💩</span> }
function EyeIcon() { return <span className="text-rose-400 text-lg">🩺</span> }
function WarnIcon() { return <span className="text-ok text-lg">🛡️</span> }
function TempIcon() { return <span className="text-purple text-lg">🌡️</span> }
function BowlIcon() { return <span className="text-brand-500 text-lg">🥣</span> }
function DocIcon() { return <span className="text-ink-500 text-lg">📝</span> }
