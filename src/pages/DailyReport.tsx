import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { useLogStore } from '@/store/logStore'
import { usePetStore, useCurrentPet } from '@/store/petStore'
import { useUIStore } from '@/store/uiStore'
import { CATS } from '@/lib/cats'
import { PetAvatar } from '@/components/PetAvatar'

/**
 * 今日/最近健康总结 - 扁平卡片式，对齐最新原型：
 * - Header（返回 / 标题 / 分享）
 * - 综合评价卡：左橘猫头像 + 右评分环 + 健康标签 + 状态描述（不再用"大圆 86 + 橘猫脸"的视觉占位）
 * - 各项指标评分列表
 * - 建议
 * - 猫宁医生意见（基于今日日志自动给出，与聊天浮窗联动）
 * - 行动建议：记录到日志 / 跳到聊天问医生
 * - 分享报告 / 保存到相册 两按钮
 */
export default function DailyReportPage() {
  const nav = useNavigate()
  const currentId = usePetStore((s) => s.currentId)
  const pet = useCurrentPet()
  const today = dayjs().format('YYYY-MM-DD')
  const log = useLogStore((s) => (s.byPet[currentId] ?? {})[today])
  const { setDoctorOpen } = useUIStore()

  if (!log) return null

  const score = log.overallScore
  const label = log.summary.label
  const desc = log.summary.description
  // 评分环 SVG 的 stroke-dasharray
  const ringR = 42
  const ringC = 2 * Math.PI * ringR
  const ringOffset = ringC * (1 - Math.max(0, Math.min(100, score)) / 100)
  const ringColor =
    score >= 85 ? '#7CC25A' : score >= 70 ? '#F5A524' : '#F25F4D'

  const advice = log.advice
  const doctorOpinion = buildDoctorOpinion(pet.name, score, advice)

  const onAskDoctor = () => {
    setDoctorOpen(true)
  }
  const onGoLog = () => nav('/log')

  return (
    <div className="px-4 pt-2 pb-24 bg-cream-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => nav(-1)} className="h-9 w-9 rounded-full bg-white shadow-card grid place-items-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#3F392F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div className="text-base font-semibold">{dayjs().format('M月D日')} 健康总结</div>
        <button className="h-9 w-9 rounded-full bg-white shadow-card grid place-items-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v14" stroke="#3F392F" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </button>
      </div>

      {/* 综合评价（扁平卡：左橘猫 + 右评分环 + 文字） */}
      <div className="mt-3 rounded-3xl bg-white shadow-card p-4 flex items-center gap-4">
        <PetAvatar
          src={CATS.puddingSitting}
          alt={pet.name}
          className="h-20 w-20 rounded-2xl overflow-hidden bg-cream-100 shrink-0"
          imgClassName="object-cover"
        />
        <div className="flex-1 min-w-0">
          <div className="text-xs text-ink-400">综合评价</div>
          <div className="mt-1 flex items-center gap-3">
            {/* 评分环（仅数字居中） */}
            <div className="relative h-16 w-16 shrink-0">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle cx="50" cy="50" r={ringR} stroke="#F4E4D0" strokeWidth="8" fill="none" />
                <circle r={ringR} cx="50" cy="50" stroke={ringColor} strokeWidth="8" strokeLinecap="round" fill="none"
                  strokeDasharray={ringC} strokeDashoffset={ringOffset} />
              </svg>
              <div className="absolute inset-0 grid place-items-center text-xl font-bold text-ink-900">{score}</div>
            </div>
            <div className="flex-1 leading-tight min-w-0">
              <div className="text-base font-bold text-brand-500">{label}</div>
              <div className="mt-0.5 text-[11px] text-ink-500 line-clamp-2">{desc}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 各项指标评分 */}
      <div className="mt-3 rounded-3xl bg-white shadow-card overflow-hidden">
        <div className="px-4 pt-3 pb-2 text-sm font-semibold flex items-center justify-between">
          <span>各项指标评分</span>
          <span className="text-[11px] text-ink-400 font-normal">满分 100</span>
        </div>
        {[
          ['精神与行为',  log.energy,    log.energy.severity],
          ['食欲 & 饮水', log.appetite,  log.water.severity],
          ['排泄情况',    log.stool,     log.stool.severity],
          ['五官 & 皮肤', log.coat,      log.coat.severity],
          ['呕吐 & 其他', log.vomit,     log.vomit.severity],
        ].map(([k, m, sev]: any) => (
          <div key={k} className="flex items-center justify-between px-4 py-2.5 border-t border-cream-100">
            <div className="flex items-center gap-2 min-w-0">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ background: sev === 'ok' ? '#7CC25A' : sev === 'warn' ? '#F5A524' : '#F25F4D' }} />
              <div className="text-xs">{k}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-[11px] text-ink-400">{m.score} 分</div>
              <div className="text-ink-300 text-base">›</div>
            </div>
          </div>
        ))}
      </div>

      {/* 建议 */}
      <div className="mt-3 rounded-3xl bg-brand-50 px-4 py-4">
        <div className="text-sm font-semibold text-brand-700 flex items-center gap-1.5">
          <span>★</span>建议
        </div>
        <div className="mt-2 text-xs text-ink-700 space-y-1.5">
          {advice.map((a, i) => (
            <div key={i} className="flex gap-1.5">
              <span className="text-brand-500 shrink-0">•</span>
              <span>{a}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 猫宁医生意见（基于今日日志自动生成） */}
      <div className="mt-3 rounded-3xl bg-white shadow-card p-4">
        <div className="flex items-center gap-2">
          <PetAvatar
            src={CATS.doctorGreeting}
            alt="猫宁医生"
            className="h-8 w-8 rounded-full overflow-hidden bg-brand-100 ring-1 ring-cream-200 shrink-0"
            imgClassName="object-cover"
          />
          <div className="flex-1 leading-tight">
            <div className="text-sm font-semibold">猫宁医生意见</div>
            <div className="text-[11px] text-ink-400">基于今日日志综合判断</div>
          </div>
          <button onClick={onAskDoctor} className="text-[11px] text-brand-500 inline-flex items-center gap-0.5">
            详细问诊 ›
          </button>
        </div>
        <div className="mt-2.5 text-xs text-ink-700 leading-relaxed whitespace-pre-wrap">{doctorOpinion}</div>
      </div>

      {/* 行动建议（与聊天浮窗联动） */}
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <button onClick={onGoLog} className="rounded-2xl bg-white shadow-card py-3 text-xs font-medium flex items-center justify-center gap-1.5 active:scale-[0.98]">
          <span className="text-brand-500">📝</span> 记录到日志
        </button>
        <button onClick={onAskDoctor} className="rounded-2xl bg-white shadow-card py-3 text-xs font-medium flex items-center justify-center gap-1.5 active:scale-[0.98]">
          <span className="text-warn">🩺</span> 问诊猫宁医生
        </button>
      </div>

      {/* 操作（分享 + 保存到相册） */}
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <button className="rounded-2xl bg-white shadow-card py-3 text-xs font-medium flex items-center justify-center gap-1.5 active:scale-[0.98]">
          <span className="text-brand-500">↗</span> 分享报告
        </button>
        <button className="rounded-2xl bg-brand-500 py-3 text-xs font-medium text-white shadow-card flex items-center justify-center gap-1.5 active:scale-[0.98]">
          <span>📅</span> 保存到相册
        </button>
      </div>
    </div>
  )
}

/**
 * 基于当日评分与建议生成一段简短的"猫宁医生意见"
 * 真实场景下应来自后端/LLM，这里用规则式模板保持离线可用。
 */
function buildDoctorOpinion(name: string, score: number, advice: string[]): string {
  const core = advice[0] ?? '继续保持当前作息与饮食'
  if (score >= 90) return `${name}今日各项指标优秀，精神与排泄均处于理想水平。${core}，并定期监测体重。`
  if (score >= 80) return `${name}今日整体状态良好。${core}。如连续 3 天同向波动，建议记录饮食与活动。`
  if (score >= 70) return `${name}今日有 1–2 项指标需要关注。${core}，如有加重或持续 2 天以上，建议就医检查。`
  return `${name}今日多项指标偏离正常。${core}，建议尽快预约兽医面诊，期间记录吃喝与排泄频次。`
}