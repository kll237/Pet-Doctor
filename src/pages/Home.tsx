import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { usePetStore, useCurrentPet } from '@/store/petStore'
import { useLogStore } from '@/store/logStore'
import { useMessagesStore } from '@/store/messagesStore'
import { CATS } from '@/lib/cats'
import { PetAvatar } from '@/components/PetAvatar'

/**
 * 首页 - 严格对齐原型图：
 * - 顶部：头像（橘猫布丁圆形头像）+ 名字 + 通知
 * - 今日健康状态大卡（橘猫布丁坐姿图 + 86分 + 健康 + 描述）
 * - AI 宠物照片分析（白底卡 + 橘猫布丁侧脸 + 橙色"去拍照"按钮）
 * - 6 格紧凑指标（3×2）
 * - 健康风险提示（带绿盾的黑猫装饰图）
 */
export default function HomePage() {
  const nav = useNavigate()
  const pet = useCurrentPet()
  const currentId = usePetStore((s) => s.currentId)
  const today = dayjs().format('YYYY-MM-DD')
  const log = useLogStore((s) => (s.byPet[currentId] ?? {})[today])
  const todayLog = log ?? null

  const metrics: {
    key: string
    label: string
    value: string
    severity: 'ok' | 'warn' | 'alert'
    icon: React.ReactNode
    iconBg: string
  }[] = todayLog
    ? [
        { key: 'appetite', label: '食欲',   value: '良好', severity: 'ok', icon: <FoodIcon />,  iconBg: 'bg-brand-50' },
        { key: 'water',    label: '饮水',   value: '正常', severity: 'ok', icon: <DropIcon />,  iconBg: 'bg-info/10' },
        { key: 'stool',    label: '排便',   value: '正常', severity: 'ok', icon: <PooIcon />,   iconBg: 'bg-warn/10' },
        { key: 'urine',    label: '排尿',   value: '正常', severity: 'ok', icon: <DropIcon />,  iconBg: 'bg-purple/10' },
        { key: 'energy',   label: '活跃度', value: '良好', severity: 'ok', icon: <CatIcon />,   iconBg: 'bg-alert/10' },
        { key: 'sleep',    label: '睡眠',   value: '充足', severity: 'ok', icon: <MoonIcon />,  iconBg: 'bg-ok/10' },
      ]
    : []

  const riskLevel = !todayLog ? '无异常' : todayLog.overallScore >= 88 ? '无异常' : '轻微异常'
  const riskDesc = !todayLog ? '继续保持当前的健康状态' : todayLog.summary.description

  const unread = useMessagesStore((s) => s.messages.filter((m) => !m.read).length)

  return (
    <div className="px-4 pt-2 pb-28 bg-cream-50 min-h-full">
      {/* 顶部：橘猫头像 + 宠物信息 + 通知 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PetAvatar
            src={pet.avatar || CATS.puddingAvatar}
            alt={pet.name}
            className="h-12 w-12 rounded-2xl overflow-hidden bg-cream-200 shadow-card"
          />
          <div className="leading-tight">
            <div className="flex items-center gap-1">
              <span className="text-base font-semibold">{pet.name}</span>
              <span className="text-brand-500 text-base">{pet.gender === 'male' ? '♂' : '♀'}</span>
            </div>
            <div className="text-[11px] text-ink-500">
              {pet.ageLabel} <span className="mx-1 text-ink-300">·</span> {pet.weight}kg <span className="mx-1 text-ink-300">·</span> {pet.neutered ? '已绝育' : '未绝育'}
            </div>
          </div>
        </div>
        <button
          onClick={() => nav('/messages')}
          className="relative h-9 w-9 rounded-full bg-white shadow-card grid place-items-center active:scale-95 transition-transform"
          aria-label="消息中心"
        >
          <BellIcon />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-alert text-white text-[10px] font-semibold grid place-items-center ring-2 ring-cream-50">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </button>
      </div>

      {/* 今日健康状态大卡（含橘猫坐姿图 - 让布丁和卡片融为一体） */}
      <div className="relative mt-3 rounded-3xl bg-gradient-to-br from-[#FFF1DA] via-[#FFE7C7] to-[#FCD9A8] shadow-card overflow-hidden">
        <div className="relative px-5 pt-4 pb-1">
          {/* 右侧：布丁坐姿图作为插画融入（占右侧半幅，从顶部到底部延伸） */}
          <PetAvatar
            src={CATS.puddingSitting}
            alt="布丁"
            className="absolute right-0 top-0 bottom-0 w-[58%] pointer-events-none"
            imgClassName="object-cover object-center"
          />
          {/* 文字层浮在猫图之上，避免被遮 */}
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-semibold text-ink-900">今日健康状态</div>
                <div className="text-[11px] text-ink-400 mt-0.5">{dayjs().format('YYYY年M月DD日')} · 周{weekdayCN(dayjs().day())}</div>
              </div>
              <div className="flex items-center gap-1 text-warn text-xs font-medium">
                <SunIcon /> <span>{(todayLog?.weatherC ?? 25)}°C</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-1.5">
                <span className="text-5xl font-bold text-ink-900 leading-none">{todayLog?.overallScore ?? 86}</span>
                <span className="text-base text-ink-900 leading-none">分</span>
              </div>
              <div className="mt-2 text-warn text-sm font-semibold inline-flex items-center gap-1">
                <span>✓</span>{todayLog?.summary.label ?? '健康'}
              </div>
              <div className="mt-0.5 text-xs text-ink-700 max-w-[60%]">{todayLog?.summary.description ?? '状态良好，继续保持哦～'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* AI 宠物照片分析（白底卡 + 橘猫侧脸 + 右侧橙色按钮） */}
      <button
        onClick={() => nav('/ai')}
        className="mt-3 w-full rounded-3xl bg-white shadow-card px-4 py-3.5 flex items-center justify-between active:scale-[0.99] transition-transform"
      >
        <div className="flex items-center gap-3 text-left min-w-0">
          <PetAvatar
            src={CATS.puddingSideFace}
            alt="布丁"
            className="h-11 w-11 rounded-xl overflow-hidden bg-cream-100 shadow-card shrink-0"
          />
          <div className="min-w-0">
            <div className="text-sm font-semibold">AI 宠物照片分析</div>
            <div className="text-[11px] text-ink-400 mt-0.5">上传/拍照，AI 识别健康状况</div>
          </div>
        </div>
        <div className="rounded-2xl bg-brand-500 text-white px-3.5 py-2 text-xs font-medium inline-flex items-center gap-1.5 shadow-card shrink-0">
          <CameraIcon /> 去拍照
        </div>
      </button>

      {/* 6 格紧凑指标（3×2） */}
      <div className="mt-3 grid grid-cols-3 gap-2.5">
        {metrics.map((m) => (
          <button
            key={m.key}
            onClick={() => nav('/log')}
            className="rounded-2xl bg-white shadow-card px-2 py-3 flex flex-col items-center gap-1.5 active:scale-[0.97] transition-transform"
          >
            <div className={`h-10 w-10 rounded-full ${m.iconBg} grid place-items-center`}>{m.icon}</div>
            <div className="text-xs font-semibold text-ink-700">{m.label}</div>
            <div className={`text-[10px] ${m.severity === 'ok' ? 'text-ok' : m.severity === 'warn' ? 'text-warn' : 'text-alert'}`}>{m.value}</div>
          </button>
        ))}
      </div>

      {/* 健康风险提示（带绿盾的黑猫装饰图） */}
      <div className="mt-3 rounded-3xl bg-cream-100 px-4 py-3 flex items-center gap-3 shadow-card">
        <PetAvatar
          src={CATS.decoHealthBlack}
          alt="健康猫"
          className="h-14 w-14 rounded-full overflow-hidden bg-white shadow-card shrink-0"
        />
        <div className="flex-1 leading-tight min-w-0">
          <div className="text-sm font-semibold">健康风险提示</div>
          <div className={`mt-0.5 text-xs font-medium ${riskLevel === '无异常' ? 'text-ok' : 'text-warn'}`}>{riskLevel}</div>
          <div className="mt-0.5 text-[11px] text-ink-500 truncate">{riskDesc}</div>
        </div>
      </div>
    </div>
  )
}

function weekdayCN(d: number) { return ['日', '一', '二', '三', '四', '五', '六'][d] }

// ===== 图标（统一风格，描边 + 填充） =====
function FoodIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 16c2 2 5 2 7 0s5-2 7 0 5 2 4-2c-1-3-3-5-9-5s-8 2-9 5c-1 4 1 4 0 2z" fill="#F4A12C"/></svg> }
function DropIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 3c-3 4-6 7-6 11a6 6 0 0 0 12 0c0-4-3-7-6-11z" fill="#3FA7E5"/></svg> }
function PooIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 11c-2 0-3 2-3 4s1 4 3 4h6c2 0 3-2 3-4s-1-4-3-4c0-2-2-4-3-4s-3 2-3 4z" fill="#C28D53"/></svg> }
function CatIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="13" r="6" fill="#F25F4D"/><path d="M7 9l1-3 3 2 1-2 1 2 3-2 1 3" fill="#F25F4D" stroke="#F25F4D" strokeWidth="1" strokeLinejoin="round"/></svg> }
function MoonIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20 14a8 8 0 1 1-9-10 6 6 0 0 0 9 10z" fill="#7CC25A"/></svg> }

function BellIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 16V11a6 6 0 0 1 12 0v5l1 2H5l1-2zM10 21a2 2 0 0 0 4 0" stroke="#3F392F" strokeWidth="1.6" strokeLinejoin="round"/></svg> }
function SunIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" fill="#F5A524"/><g stroke="#F5A524" strokeWidth="1.6" strokeLinecap="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/></g></svg> }
function CameraIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" stroke="#fff" strokeWidth="1.6"/><circle cx="12" cy="13" r="3.4" stroke="#fff" strokeWidth="1.6"/></svg> }
