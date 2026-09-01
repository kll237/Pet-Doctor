import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { usePetStore } from '@/store/petStore'
import { useLogStore } from '@/store/logStore'
import { severityText } from '@/lib/utils'

/**
 * 首页 - 完全还原原型图：
 * - 顶部宠物基础信息
 * - 今日健康状态卡 (天气 + 86分 + 健康)
 * - AI 宠物照片分析入口
 * - 6 格指标卡
 * - 健康风险提示
 * - 4 个快捷入口
 */
export default function HomePage() {
  const nav = useNavigate()
  const pet = usePetStore((s) => s.pet)
  const today = dayjs().format('YYYY-MM-DD')
  const log = useLogStore((s) => s.logs[today])
  const todayLog = log ?? null

  const metrics: { key: string; label: string; icon: React.ReactNode; value: string; severity: 'ok' | 'warn' | 'alert' }[] = todayLog
    ? [
        { key: 'appetite', label: '食欲', icon: <FoodIcon />, value: '良好',  severity: 'ok' },
        { key: 'water',    label: '饮水', icon: <DropIcon />, value: '正常',  severity: 'ok' },
        { key: 'stool',    label: '排便', icon: <PooIcon />,  value: '正常',  severity: 'ok' },
        { key: 'urine',    label: '排尿', icon: <DropIcon />, value: '正常',  severity: 'ok' },
        { key: 'energy',   label: '活跃度', icon: <CatIcon />,value: '良好',  severity: 'ok' },
        { key: 'sleep',    label: '睡眠', icon: <MoonIcon />, value: '充足',  severity: 'ok' },
      ]
    : []

  const riskLevel = !todayLog ? '无异常' : todayLog.overallScore >= 88 ? '无异常' : '轻微异常'
  const riskDesc  = !todayLog ? '继续保持当前的健康状态' : todayLog.summary.description

  return (
    <div className="px-4 pt-2 pb-20 bg-cream-50 min-h-full">
      {/* 顶部：头像 + 宠物信息 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-2xl overflow-hidden bg-cream-200 shadow-card grid place-items-center text-3xl">
            {pet.avatar}
          </div>
          <div className="leading-tight">
            <div className="flex items-center gap-1">
              <span className="text-lg font-semibold">{pet.name}</span>
              <span className="text-brand-500 text-lg">♀</span>
            </div>
            <div className="text-xs text-ink-500">
              {pet.ageLabel} <span className="mx-1 text-ink-300">·</span> {pet.weight}kg <span className="mx-1 text-ink-300">·</span> {pet.neutered ? '已绝育' : '未绝育'}
            </div>
          </div>
        </div>
        <button className="relative h-10 w-10 rounded-full bg-white shadow-card grid place-items-center" aria-label="通知">
          <BellIcon />
          <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-alert" />
        </button>
      </div>

      {/* 今日健康状态大卡 */}
      <div className="relative mt-3 rounded-3xl bg-gradient-to-br from-cream-100 to-cream-50 shadow-card overflow-hidden">
        <div className="px-5 pt-4 pb-3 flex items-start justify-between">
          <div>
            <div className="text-sm text-ink-500">今日健康状态</div>
            <div className="text-xs text-ink-400 mt-0.5">{dayjs().format('YYYY年M月DD日')} 周{weekdayCN(dayjs().day())}</div>
          </div>
          <div className="flex items-center gap-1 text-warn text-sm">
            <SunIcon /> <span>{(todayLog?.weatherC ?? 25)}°C</span>
          </div>
        </div>
        <div className="px-5 pb-2">
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-bold text-ink-900 leading-none">{todayLog?.overallScore ?? 86}</span>
            <span className="text-2xl text-ink-900 leading-none">分</span>
          </div>
          <div className="mt-2 text-warn font-semibold">{todayLog?.summary.label ?? '健康'}</div>
          <div className="mt-1 text-sm text-ink-700">{todayLog?.summary.description ?? '状态良好，继续保持哦～'}</div>
        </div>
        {/* 装饰爪印 */}
        <div className="absolute right-3 bottom-3 text-cream-200 text-7xl opacity-60 select-none">🐾</div>
      </div>

      {/* AI 宠物照片分析 */}
      <button
        onClick={() => nav('/ai')}
        className="mt-4 w-full rounded-3xl bg-white shadow-card px-5 py-4 flex items-center justify-between active:scale-[0.99] transition-transform"
      >
        <div className="text-left">
          <div className="text-base font-semibold">AI 宠物照片分析</div>
          <div className="text-xs text-ink-400 mt-1">上传/拍照，AI 识别健康状况</div>
        </div>
        <div className="rounded-2xl bg-brand-500 text-white px-4 py-2.5 text-sm font-medium inline-flex items-center gap-1.5">
          <CameraIcon /> 去拍照
        </div>
      </button>

      {/* 6 格指标 */}
      <div className="mt-4 grid grid-cols-3 gap-2.5">
        {metrics.map((m) => (
          <MetricCard key={m.key} icon={m.icon} label={m.label} value={m.value} severity={m.severity} />
        ))}
      </div>

      {/* 健康风险提示 */}
      <div className="mt-4 rounded-3xl bg-cream-100 px-4 py-3 flex items-center gap-3 shadow-card">
        <div className="h-9 w-9 rounded-full bg-ok/10 grid place-items-center text-ok">
          <ShieldIcon />
        </div>
        <div className="flex-1 leading-tight">
          <div className="text-sm font-semibold">健康风险提示</div>
          <div className={`mt-0.5 text-sm ${riskLevel === '无异常' ? 'text-ok' : 'text-warn'}`}>{riskLevel}</div>
          <div className="mt-0.5 text-xs text-ink-500">{riskDesc}</div>
        </div>
      </div>

      {/* 4 个快捷入口 */}
      <div className="mt-4 grid grid-cols-4 gap-3 rounded-3xl bg-white shadow-card px-2 py-4">
        <QuickAction icon={<CheckIcon />} label="每日记录" onClick={() => nav('/log')} />
        <QuickAction icon={<CameraIcon />} label="AI 分析" onClick={() => nav('/ai')} />
        <QuickAction icon={<TrendIcon />} label="健康趋势" onClick={() => nav('/trend')} />
        <QuickAction icon={<ArchiveIcon />} label="宠物档案" onClick={() => nav('/profile')} />
      </div>

      <div className="h-2" />
    </div>
  )
}

function MetricCard({ icon, label, value, severity }: { icon: React.ReactNode; label: string; value: string; severity: 'ok' | 'warn' | 'alert' }) {
  const color = severity === 'ok' ? 'bg-ok' : severity === 'warn' ? 'bg-warn' : 'bg-alert'
  return (
    <div className="rounded-3xl bg-white shadow-card px-3 py-3.5">
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 rounded-2xl bg-cream-100 grid place-items-center">{icon}</div>
        <div className="leading-tight">
          <div className="text-sm font-semibold">{label}</div>
          <div className="text-xs text-ink-500">{value}</div>
        </div>
      </div>
      <div className="mt-3 h-1.5 w-full rounded-full bg-cream-100 overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: severity === 'ok' ? '95%' : severity === 'warn' ? '65%' : '30%' }} />
      </div>
    </div>
  )
}

function QuickAction({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform">
      <div className="h-10 w-10 rounded-full bg-cream-100 grid place-items-center">{icon}</div>
      <div className="text-xs text-ink-700">{label}</div>
    </button>
  )
}

function weekdayCN(d: number) { return ['日', '一', '二', '三', '四', '五', '六'][d] }
function severityTextT(_: string) { return '' }

// ===== 图标 =====
function FoodIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 16c2 2 5 2 7 0s5-2 7 0 5 2 4-2c-1-3-3-5-9-5s-8 2-9 5c-1 4 1 4 0 2z" fill="#F4A12C"/></svg> }
function DropIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 3c-3 4-6 7-6 11a6 6 0 0 0 12 0c0-4-3-7-6-11z" fill="#3FA7E5"/></svg> }
function PooIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 11c-2 0-3 2-3 4s1 4 3 4h6c2 0 3-2 3-4s-1-4-3-4c0-2-2-4-3-4s-3 2-3 4z" fill="#C28D53"/></svg> }
function CatIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="13" r="6" fill="#F4A12C"/><circle cx="12" cy="13" r="6" stroke="#3F392F" strokeWidth="1"/><path d="M7 9l1-3 3 2 1-2 1 2 3-2 1 3" fill="#F4A12C" stroke="#3F392F" strokeWidth="1"/></svg> }
function MoonIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20 14a8 8 0 1 1-9-10 6 6 0 0 0 9 10z" fill="#9B7AE6"/></svg> }
function BellIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M6 16V11a6 6 0 0 1 12 0v5l1 2H5l1-2zM10 21a2 2 0 0 0 4 0" stroke="#3F392F" strokeWidth="1.6" strokeLinejoin="round"/></svg> }
function SunIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" fill="#F5A524"/><g stroke="#F5A524" strokeWidth="1.6" strokeLinecap="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/></g></svg> }
function CameraIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" stroke="#fff" strokeWidth="1.6"/><circle cx="12" cy="13" r="3.4" stroke="#fff" strokeWidth="1.6"/></svg> }
function CheckIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="4" y="5" width="16" height="15" rx="2.5" stroke="#3F392F" strokeWidth="1.6"/><path d="M8 13l3 3 5-6" stroke="#F4A12C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg> }
function TrendIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 16 9 11l4 3 7-7" stroke="#3F392F" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" fill="none"/></svg> }
function ArchiveIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="5" rx="1.5" stroke="#3F392F" strokeWidth="1.6"/><rect x="4" y="10" width="16" height="10" rx="1.5" stroke="#3F392F" strokeWidth="1.6"/><path d="M10 15h4" stroke="#F4A12C" strokeWidth="2" strokeLinecap="round"/></svg> }
function ShieldIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3l8 3v5c0 5-4 9-8 10-4-1-8-5-8-10V6l8-3z" stroke="#7CC25A" strokeWidth="1.6" fill="#E8F4DE"/><path d="M9 12l2 2 4-4" stroke="#7CC25A" strokeWidth="2" strokeLinecap="round" fill="none"/></svg> }
