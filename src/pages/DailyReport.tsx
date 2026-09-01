import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { useLogStore } from '@/store/logStore'

/**
 * 今日健康总结 - 原型图右下角展示卡片化
 * 86 分 / 健康 / 状态良好 / 各项指标评分 / 建议 / 分享 + 保存
 */
export default function DailyReportPage() {
  const nav = useNavigate()
  const today = dayjs().format('YYYY-MM-DD')
  const log = useLogStore((s) => s.logs[today])
  if (!log) return null

  return (
    <div className="px-4 pt-2 pb-24 bg-cream-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => nav(-1)} className="h-9 w-9 rounded-full bg-white shadow-card grid place-items-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#3F392F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div className="text-lg font-semibold">今日健康总结</div>
        <button className="h-9 w-9 rounded-full bg-white shadow-card grid place-items-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#3F392F" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
      </div>

      {/* 综合评估卡片 */}
      <div className="mt-3 rounded-3xl bg-white shadow-card p-6 text-center relative overflow-hidden">
        <div className="text-sm font-semibold">综合评估</div>
        <div className="mt-3 mx-auto h-32 w-32 rounded-full grid place-items-center bg-gradient-to-br from-cream-100 to-cream-50 shadow-card relative">
          <span className="text-5xl font-bold text-brand-500 leading-none">{log.overallScore}</span>
          <span className="absolute right-4 top-4 text-warn text-sm">分</span>
          {/* 装饰花瓣 */}
          <span className="absolute -top-1 left-2 text-warn text-2xl">✿</span>
          <span className="absolute -bottom-1 right-2 text-warn text-2xl">✿</span>
        </div>
        <div className="mt-3 text-2xl font-bold text-brand-500">{log.summary.label}</div>
        <div className="mt-1 text-sm text-ink-700">状态良好，继续保持当日的护生活哦~</div>
      </div>

      {/* 各项指标评分 */}
      <div className="mt-4 rounded-3xl bg-white shadow-card">
        <div className="px-5 pt-3 pb-2 text-sm font-semibold">各项指标评分</div>
        {[
          ['精神与行为', log.energy, log.energy.severity],
          ['食欲 & 饮水', log.appetite, log.water.severity],
          ['排泄情况', log.stool, log.stool.severity],
          ['五官 & 皮肤', log.coat, log.coat.severity],
          ['呕吐 & 其他', log.vomit, log.vomit.severity],
        ].map(([k, m, sev]: any) => (
          <div key={k} className="flex items-center justify-between px-5 py-2.5 border-t border-cream-100">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: sev === 'ok' ? '#7CC25A' : sev === 'warn' ? '#F5A524' : '#F25F4D' }} />
              <div className="text-sm">{k}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs text-ink-400">{m.score} 分</div>
              <div className="text-ink-300">›</div>
            </div>
          </div>
        ))}
      </div>

      {/* 建议 */}
      <div className="mt-3 rounded-3xl bg-brand-50 px-5 py-4">
        <div className="text-sm font-semibold text-brand-700">建议</div>
        <div className="mt-2 text-sm text-ink-700 space-y-1.5">
          {log.advice.map((a, i) => (
            <div key={i}>• {a}</div>
          ))}
        </div>
      </div>

      {/* 操作 */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button className="rounded-2xl bg-white shadow-card py-3 text-sm font-medium flex items-center justify-center gap-1.5">
          <span className="text-brand-500">↗</span> 分享报告
        </button>
        <button className="rounded-2xl bg-brand-500 py-3 text-sm font-medium text-white shadow-card flex items-center justify-center gap-1.5">
          <span>📅</span> 保存到相册
        </button>
      </div>
    </div>
  )
}
