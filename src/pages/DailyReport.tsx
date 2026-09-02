import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { useLogStore } from '@/store/logStore'
import { usePetStore } from '@/store/petStore'

/**
 * 今日健康总结 - 严格对齐原型图：
 * - 大圆综合评价（带✿ 装饰 + 86 分 + 健康 + 状态描述）
 * - 各项指标评分列表（圆点 + 名称 + 分数 + 箭头）
 * - 建议（黄色品牌色卡）
 * - 分享报告 / 保存到相册 两按钮
 */
export default function DailyReportPage() {
  const nav = useNavigate()
  const currentId = usePetStore((s) => s.currentId)
  const today = dayjs().format('YYYY-MM-DD')
  const log = useLogStore((s) => (s.byPet[currentId] ?? {})[today])
  if (!log) return null

  return (
    <div className="px-4 pt-2 pb-24 bg-cream-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => nav(-1)} className="h-9 w-9 rounded-full bg-white shadow-card grid place-items-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#3F392F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div className="text-base font-semibold">今日健康总结</div>
        <button className="h-9 w-9 rounded-full bg-white shadow-card grid place-items-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v14" stroke="#3F392F" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </button>
      </div>

      {/* 综合评估大卡 */}
      <div className="mt-3 rounded-3xl bg-white shadow-card p-6 text-center relative overflow-hidden">
        <div className="text-sm font-semibold text-ink-700">综合评价</div>
        <div className="mt-3 mx-auto h-36 w-36 rounded-full grid place-items-center bg-gradient-to-br from-cream-100 to-cream-50 shadow-card relative">
          <span className="text-5xl font-bold text-brand-500 leading-none">{log.overallScore}</span>
          <span className="absolute right-5 top-5 text-warn text-sm">分</span>
          {/* 装饰花瓣 */}
          <span className="absolute -top-1 left-3 text-warn text-2xl">✿</span>
          <span className="absolute -bottom-1 right-3 text-warn text-2xl">✿</span>
        </div>
        <div className="mt-3 text-2xl font-bold text-brand-500">{log.summary.label}</div>
        <div className="mt-1 text-xs text-ink-700">状态良好，继续保持当日的护生活哦~</div>
      </div>

      {/* 各项指标评分 */}
      <div className="mt-3 rounded-3xl bg-white shadow-card overflow-hidden">
        <div className="px-4 pt-3 pb-2 text-sm font-semibold">各项指标评分</div>
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

      {/* 建议（品牌色淡背景） */}
      <div className="mt-3 rounded-3xl bg-brand-50 px-4 py-4">
        <div className="text-sm font-semibold text-brand-700">建议</div>
        <div className="mt-2 text-xs text-ink-700 space-y-1.5">
          {log.advice.map((a, i) => (
            <div key={i}>• {a}</div>
          ))}
        </div>
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
