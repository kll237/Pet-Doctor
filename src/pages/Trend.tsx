import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart,
} from 'recharts'
import { useLogStore } from '@/store/logStore'

const SPANS = [
  { key: 7, label: '7天' },
  { key: 30, label: '30天' },
  { key: 90, label: '90天' },
] as const

export default function TrendPage() {
  const nav = useNavigate()
  const [span, setSpan] = useState<7 | 30 | 90>(30)
  const logs = useLogStore((s) => s.logs)
  const today = dayjs().format('YYYY-MM-DD')

  // 生成模拟数据
  const series = useMemo(() => {
    const days: { date: string; overall: number; appetite: number; water: number; stool: number; energy: number; sleep: number; urine: number }[] = []
    const seed = span === 7 ? 86 : span === 30 ? 84 : 82
    for (let i = span - 1; i >= 0; i--) {
      const d = dayjs().subtract(i, 'day')
      const noise = () => Math.round((Math.random() - 0.5) * 10)
      const isToday = d.format('YYYY-MM-DD') === today
      const log = logs[d.format('YYYY-MM-DD')]
      days.push({
        date: d.format('MM-DD'),
        overall: isToday ? log?.overallScore ?? 86 : seed + noise(),
        appetite: 78 + noise(),
        water: 70 + noise(),
        stool: 88 + noise(),
        energy: 85 + noise(),
        sleep: 90 + noise(),
        urine: 88 + noise(),
      })
    }
    return days
  }, [span, logs, today])

  const overallTrend = series[series.length - 1].overall - series[series.length - 8 >= 0 ? series.length - 8 : 0].overall

  return (
    <div className="px-4 pt-2 pb-24 bg-cream-50 min-h-full">
      <div className="flex items-center justify-between">
        <button onClick={() => nav(-1)} className="h-9 w-9 rounded-full bg-white shadow-card grid place-items-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#3F392F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div className="text-lg font-semibold">健康趋势</div>
        <button className="rounded-full bg-brand-50 px-3 py-1.5 text-xs text-brand-500">布丁 ▾</button>
      </div>

      {/* 时间筛选 */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {SPANS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSpan(s.key as 7 | 30 | 90)}
            className={`py-2 rounded-full text-sm ${span === s.key ? 'bg-brand-500 text-white shadow-card' : 'bg-white text-ink-700'}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* 综合评分卡片 */}
      <div className="mt-4 rounded-3xl bg-white shadow-card px-5 py-4">
        <div className="text-sm font-semibold">健康评分趋势</div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-ink-900">{series[series.length - 1].overall}</span>
          <span className="text-sm text-warn">
            {overallTrend >= 0 ? '↗ 比上次 +' : '↘ 比上次 '}{Math.abs(overallTrend)}分
          </span>
        </div>
        <div className="mt-2 h-40 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series}>
              <defs>
                <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#F4A12C" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#F4A12C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0E7D5" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9B8E7F' }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: '#9B8E7F' }} width={28} domain={[60, 100]} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px -8px rgba(60,50,30,0.18)' }}
                formatter={(v) => [`${v}`, '评分']}
              />
              <Area type="monotone" dataKey="overall" stroke="#F4A12C" strokeWidth={2.4} fill="url(#g1)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 各项指标趋势 */}
      <div className="mt-4">
        <div className="text-sm font-semibold mb-2">各项指标趋势</div>
        <div className="grid grid-cols-2 gap-3">
          <MiniMetric title="食欲"   status="正常" severity="ok"   data={series.map((d) => ({ x: d.date, y: d.appetite }))} color="#F4A12C" />
          <MiniMetric title="饮水"   status="正常" severity="ok"   data={series.map((d) => ({ x: d.date, y: d.water }))}    color="#3FA7E5" />
          <MiniMetric title="排便"   status="正常" severity="ok"   data={series.map((d) => ({ x: d.date, y: d.stool }))}    color="#F5A524" />
          <MiniMetric title="排尿"   status="正常" severity="ok"   data={series.map((d) => ({ x: d.date, y: d.urine }))}    color="#9B7AE6" />
          <MiniMetric title="活跃度" status="良好" severity="ok"   data={series.map((d) => ({ x: d.date, y: d.energy }))}   color="#F25F4D" />
          <MiniMetric title="睡眠"   status="充足" severity="ok"   data={series.map((d) => ({ x: d.date, y: d.sleep }))}    color="#F7B654" />
        </div>
      </div>
      <div className="h-2" />
    </div>
  )
}

function MiniMetric({
  title, status, severity, data, color,
}: { title: string; status: string; severity: 'ok' | 'warn' | 'alert'; data: { x: string; y: number }[]; color: string }) {
  const head = data[data.length - 1]?.y ?? 85
  return (
    <div className="rounded-3xl bg-white shadow-card px-3 py-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">{title}</div>
        <div className={`pill ${severity === 'ok' ? 'status-ok' : severity === 'warn' ? 'status-warn' : 'status-alert'}`}>{status}</div>
      </div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-ink-900">{head}</span>
        <span className="text-xs text-ink-400">分</span>
      </div>
      <div className="-ml-2 h-14 mt-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line type="monotone" dataKey="y" stroke={color} strokeWidth={2} dot={false} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px -8px rgba(60,50,30,0.18)' }}
              labelFormatter={(_, p: any) => p?.[0]?.payload?.x ?? ''}
              formatter={(v) => [`${v}`, '分']}
            />
            <YAxis hide domain={['dataMin - 4', 'dataMax + 4']} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
