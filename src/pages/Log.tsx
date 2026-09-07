import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { useLogStore } from '@/store/logStore'
import { usePetStore, useCurrentPet } from '@/store/petStore'
import { useUIStore } from '@/store/uiStore'
import { CATS } from '@/lib/cats'
import { PetAvatar } from '@/components/PetAvatar'

/**
 * 每日日志 - 严格对齐原型图：
 * - 左返回 / 中标题 / 右日历图标（点击可自由选日期）
 * - 顶部一行：上一周 / 当周 / 下一周 + "今天"按钮 + 任意日期选择器
 * - 5 个状态项卡片（圆形彩色图标 + 标题 + 描述 + 状态 pill）
 * - 6. 饮食喂养卡片（原型新增项）
 * - 底部大橙色 "记录今日状态" 按钮 + 黑色小猫装饰
 */
export default function LogPage() {
  const nav = useNavigate()
  const currentId = usePetStore((s) => s.currentId)
  const logs = useLogStore((s) => s.byPet[currentId] ?? {})
  const pet = useCurrentPet()
  const { openSheet } = useUIStore()

  // 默认指向今天；可自由改成任意一天
  const today = dayjs().format('YYYY-MM-DD')
  const [selectedDate, setSelectedDate] = useState<string>(today)

  const days = useMemo(() => {
    // 以 selectedDate 为中心前后各 3 天（共 7 天）
    const center = dayjs(selectedDate)
    return Array.from({ length: 7 }).map((_, i) => center.add(i - 3, 'day'))
  }, [selectedDate])

  const cur = logs[selectedDate] ?? null

  const itemsCount = 6
  const completed = cur ? itemsCount : 0

  const items: {
    icon: React.ReactNode
    iconBg: string
    title: string
    sub: string
    tag: string
    severity: 'ok' | 'warn' | 'alert'
    sheet: 'energy' | 'appetite' | 'stool' | 'eyes' | 'vomit' | 'feeding'
  }[] = cur
    ? [
        { icon: <CatIcon />,   iconBg: 'bg-brand-50',  title: '精神与行为', sub: cur.energy.description,   tag: severityText(cur.energy.severity),   severity: cur.energy.severity,   sheet: 'energy' },
        { icon: <FoodIcon />,  iconBg: 'bg-info/10',   title: '食欲 & 饮水', sub: `食欲 ${cur.appetite.description}，饮水量 ${cur.water.description}`, tag: severityText(cur.water.severity), severity: cur.water.severity, sheet: 'appetite' },
        { icon: <PooIcon />,   iconBg: 'bg-warn/10',   title: '排泄情况',   sub: `${cur.stool.description}，${cur.urine.description}`, tag: severityText(cur.stool.severity), severity: cur.stool.severity, sheet: 'stool' },
        { icon: <CoatIcon />,  iconBg: 'bg-rose-50',   title: '五官 & 皮肤', sub: cur.coat.description,     tag: severityText(cur.coat.severity),   severity: cur.coat.severity,   sheet: 'eyes' },
        { icon: <WarnIcon />,  iconBg: 'bg-purple/10', title: '呕吐 & 其他', sub: cur.vomit.description,    tag: '无异常', severity: cur.vomit.severity, sheet: 'vomit' },
        { icon: <FeedingIcon />, iconBg: 'bg-brand-50', title: '饮食喂养', sub: cur.feedingNote || '主粮：XX 冻干猫粮', tag: cur.feedingNote ? '已记录' : '待记录', severity: 'ok', sheet: 'feeding' },
      ]
    : []

  const shiftWeek = (delta: number) => {
    setSelectedDate(dayjs(selectedDate).add(delta * 7, 'day').format('YYYY-MM-DD'))
  }
  const goToday = () => setSelectedDate(today)

  return (
    <div className="px-4 pt-2 pb-24 bg-cream-50 min-h-full relative">
      {/* 顶部 */}
      <div className="flex items-center justify-between">
        <button onClick={() => nav(-1)} className="h-9 w-9 rounded-full bg-white shadow-card grid place-items-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#3F392F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div className="text-base font-semibold">每日日志</div>
        <label className="h-9 w-9 rounded-full bg-white shadow-card grid place-items-center cursor-pointer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="5" width="18" height="16" rx="2" stroke="#3F392F" strokeWidth="1.6" />
            <path d="M3 9h18M8 3v4M16 3v4" stroke="#3F392F" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value || today)}
            className="absolute opacity-0 w-0 h-0"
          />
        </label>
      </div>

      {/* 日期选择 + 自由跳转栏 */}
      <div className="mt-3 rounded-3xl bg-white shadow-card px-3 py-3.5">
        <div className="px-1 flex items-center justify-between">
          <div className="text-sm font-semibold">{dayjs(selectedDate).format('YYYY年M月DD日')}</div>
          <div className="flex gap-1.5 items-center">
            <button onClick={() => shiftWeek(-1)} className="h-6 w-6 rounded-full bg-cream-100 grid place-items-center text-xs text-ink-500">‹</button>
            <button onClick={goToday} className={`px-2.5 h-6 rounded-full text-[11px] font-medium ${selectedDate === today ? 'bg-brand-500 text-white' : 'bg-cream-100 text-ink-700'}`}>今天</button>
            <button onClick={() => shiftWeek(1)} className="h-6 w-6 rounded-full bg-cream-100 grid place-items-center text-xs text-ink-500">›</button>
          </div>
        </div>
        {/* 自由选日期（原型需要"从上面时候开始"可自己选） */}
        <div className="mt-2 px-1 flex items-center gap-2">
          <span className="text-[11px] text-ink-400 shrink-0">跳转到</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value || today)}
            className="flex-1 rounded-xl bg-cream-50 px-2 py-1 text-xs outline-none border border-cream-200"
          />
        </div>
        <div className="mt-2.5 grid grid-cols-7 gap-1 text-center">
          {['日', '一', '二', '三', '四', '五', '六'].map((w) => (
            <div key={w} className="text-[10px] text-ink-400 pb-0.5">{w}</div>
          ))}
          {days.map((d) => {
            const k = d.format('YYYY-MM-DD')
            const selected = k === selectedDate
            const isToday = k === today
            return (
              <button
                key={k}
                onClick={() => setSelectedDate(k)}
                className={`h-9 rounded-xl grid place-items-center text-xs ${selected ? 'bg-brand-500 text-white font-semibold' : isToday ? 'bg-brand-50 text-brand-500 font-semibold' : 'text-ink-700'}`}
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
              <div className="text-sm font-semibold">{selectedDate === today ? '今日' : dayjs(selectedDate).format('M月D日')}记录概览</div>
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

      {/* 状态项列表（含饮食喂养） */}
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

      {/* 底部大橙色 CTA + 黑色小猫装饰 */}
      <button
        onClick={() => openSheet('summary', selectedDate)}
        className="mt-4 w-full rounded-2xl bg-brand-500 py-3.5 text-white text-sm font-medium shadow-card flex items-center justify-center gap-1.5 active:scale-[0.98]"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.4" strokeLinecap="round"/></svg>
        记录{selectedDate === today ? '今日' : '当日'}状态
      </button>

      <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-ink-400">
        <span>{completed}/{itemsCount} 完成 · {pet.name}</span>
      </div>

      {/* 右下角小黑猫装饰（贴在按钮下方，与原型一致） */}
      <div className="pointer-events-none absolute right-2 -bottom-2 sm:right-6 sm:bottom-2 w-20 h-20">
        <PetAvatar
          src={CATS.decoLogBlack}
          alt="小黑猫"
          className="h-full w-full rounded-full overflow-hidden bg-transparent"
          imgClassName="object-contain"
        />
      </div>
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
function FeedingIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 9h14l-1 9a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 9z" fill="#7CC25A"/><path d="M9 9V6a3 3 0 0 1 6 0v3" stroke="#7CC25A" strokeWidth="1.6" fill="none"/></svg> }
